import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/** Cada cuánto se vuelcan las vistas acumuladas a la base. */
const VOLCADO = 30 * 1000;

/**
 * Acumula las visitas a las fichas y las escribe de golpe.
 *
 * Antes cada visita disparaba su propio `UPDATE ... views + 1`. Las lecturas
 * escalan bien —Postgres las sirve casi gratis— pero las escrituras no: cada
 * una genera WAL, compite por el bloqueo de la fila y, en Neon, cuenta contra
 * la cuota. Con dos personas mirando el mismo departamento a la vez, las dos
 * escrituras se serializan sobre la misma fila.
 *
 * Ahora se suman en memoria y se vuelcan una vez cada medio minuto: mil visitas
 * repartidas entre dieciséis fichas pasan de mil escrituras a dieciséis.
 *
 * El precio es que el contador puede ir hasta medio minuto por detrás, y que si
 * el proceso muere de golpe se pierde lo acumulado desde el último volcado. Para
 * un contador de vistas es un precio que vale la pena; para dinero no lo sería.
 */
@Injectable()
export class ViewsCounterService implements OnModuleDestroy {
  private readonly logger = new Logger(ViewsCounterService.name);
  private readonly pendientes = new Map<string, number>();
  private readonly timer: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {
    this.timer = setInterval(() => void this.volcar(), VOLCADO);
    this.timer.unref?.();
  }

  async onModuleDestroy() {
    clearInterval(this.timer);
    // Apagado ordenado: lo que quede sin volcar se escribe ahora.
    await this.volcar();
  }

  /** Suma una visita. No toca la base ni espera a nadie. */
  registrar(propertyId: string) {
    this.pendientes.set(propertyId, (this.pendientes.get(propertyId) ?? 0) + 1);
  }

  private async volcar() {
    if (this.pendientes.size === 0) return;

    // Se vacía antes de escribir: si el volcado tarda, las visitas que lleguen
    // mientras tanto entran en la siguiente tanda en vez de contarse dos veces.
    const tanda = [...this.pendientes.entries()];
    this.pendientes.clear();

    try {
      await this.prisma.$transaction(
        tanda.map(([id, suma]) =>
          this.prisma.property.update({ where: { id }, data: { views: { increment: suma } } }),
        ),
      );
    } catch (error) {
      // Un contador de vistas no justifica tumbar nada ni reintentar: se pierden
      // esas visitas y a otra cosa.
      this.logger.warn(`No se pudieron volcar ${tanda.length} contador(es): ${(error as Error).message}`);
    }
  }
}
