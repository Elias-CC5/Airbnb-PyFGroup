import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

/** Cada cuánto se revisan los vencimientos. */
const CADA = 6 * 60 * 60 * 1000; // 6 horas

/** Margen tras el arranque, para no competir con el resto del boot. */
const AL_ARRANCAR = 30 * 1000;

/**
 * Corta los planes vencidos sin esperar a que el anfitrión entre.
 *
 * Hasta ahora el vencimiento era perezoso: se aplicaba cuando el anfitrión
 * abría su panel. Quien pagaba un mes y no volvía a entrar se quedaba
 * publicado y destacado indefinidamente, así que la plataforma regalaba el
 * servicio. Este repaso lo cierra.
 *
 * Va con `setInterval` y no con `@nestjs/schedule` a propósito: es una sola
 * tarea y no justifica una dependencia nueva. Si algún día hacen falta varias
 * —recordatorios, limpiezas, informes— toca cambiar a un planificador de
 * verdad, con expresiones cron y control de solapamiento.
 *
 * Ojo con el escalado: si el servicio corriera en más de una instancia, el
 * repaso se ejecutaría en todas a la vez. Hoy Render lo corre en una sola y
 * `expireIfDue` es idempotente —sólo toca suscripciones ACTIVE ya vencidas—,
 * así que un solapamiento no rompería nada, pero conviene recordarlo.
 */
@Injectable()
export class SubscriptionsSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SubscriptionsSchedulerService.name);
  private timer?: NodeJS.Timeout;
  private arranque?: NodeJS.Timeout;
  private corriendo = false;

  constructor(private readonly subscriptions: SubscriptionsService) {}

  onModuleInit() {
    // Un primer repaso poco después de arrancar: cubre el tiempo que el
    // servicio pasó dormido o caído.
    this.arranque = setTimeout(() => void this.repasar(), AL_ARRANCAR);
    this.timer = setInterval(() => void this.repasar(), CADA);

    this.logger.log(`Repaso de planes vencidos activo (cada ${CADA / 3_600_000} h)`);
  }

  onModuleDestroy() {
    if (this.arranque) clearTimeout(this.arranque);
    if (this.timer) clearInterval(this.timer);
  }

  private async repasar() {
    // Si el repaso anterior sigue en marcha, este turno se salta: dos pasadas
    // simultáneas sobre el mismo anfitrión no aportan nada.
    if (this.corriendo) return;
    this.corriendo = true;

    try {
      const { revisadas } = await this.subscriptions.expireAllDue();
      if (revisadas > 0) {
        this.logger.log(`${revisadas} suscripción(es) vencida(s) procesada(s)`);
      }
    } catch (error) {
      // Nunca lanza: un fallo aquí no debe tumbar el proceso.
      this.logger.error(`No se pudo repasar los vencimientos: ${(error as Error).message}`);
    } finally {
      this.corriendo = false;
    }
  }
}
