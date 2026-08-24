import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

interface Entrada {
  valor: unknown;
  expira: number;
}

/** Cuántas entradas caben antes de empezar a tirar las más viejas. */
const MAXIMO = 500;

/** Cada cuánto se barren las entradas caducadas. */
const BARRIDO = 60 * 1000;

/**
 * Caché en memoria del proceso.
 *
 * Escrita a mano y no con `@nestjs/cache-manager` por dos razones: no añade
 * dependencias —el plan de Render son 512 MB y cada paquete cuenta— y permite
 * acotar el tamaño, que es lo que evita que la caché se coma la RAM que
 * necesita Prisma.
 *
 * Lo importante aquí no es guardar resultados: es `enVuelo`. Sin eso, cuando
 * una entrada caduca y llegan cincuenta peticiones a la vez, las cincuenta ven
 * el hueco y lanzan la misma consulta contra la base. Es el patrón que tumba
 * las aplicaciones justo en el momento de más tráfico, que es cuando menos
 * conviene. Con `enVuelo`, la primera consulta y las otras cuarenta y nueve
 * esperan su resultado.
 *
 * Ojo si algún día Render corre más de una instancia: cada una tendría su
 * propia copia y podrían mostrar datos distintos durante lo que dure el TTL.
 * Con TTL de minutos y un catálogo que cambia poco es asumible; si deja de
 * serlo, toca mover esto a Redis.
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly store = new Map<string, Entrada>();
  private readonly enVuelo = new Map<string, Promise<unknown>>();
  private readonly barrido: NodeJS.Timeout;

  constructor() {
    this.barrido = setInterval(() => this.limpiar(), BARRIDO);
    // No debe mantener vivo el proceso al apagarlo.
    this.barrido.unref?.();
  }

  onModuleDestroy() {
    clearInterval(this.barrido);
    this.store.clear();
    this.enVuelo.clear();
  }

  /**
   * Devuelve lo guardado bajo `clave`, o ejecuta `fn` y guarda su resultado.
   *
   * Si `fn` falla, no se guarda nada y el error sube al llamante: una consulta
   * rota no debe quedarse cacheada.
   */
  async wrap<T>(clave: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
    const guardado = this.store.get(clave);
    if (guardado && guardado.expira > Date.now()) return guardado.valor as T;

    // Ya hay alguien resolviendo esta misma clave: nos colgamos de su promesa.
    const enCurso = this.enVuelo.get(clave);
    if (enCurso) return enCurso as Promise<T>;

    const promesa = fn()
      .then((valor) => {
        this.guardar(clave, valor, ttlMs);
        return valor;
      })
      .finally(() => {
        this.enVuelo.delete(clave);
      });

    this.enVuelo.set(clave, promesa);
    return promesa;
  }

  /** Borra todas las claves que empiecen por `prefijo`. Devuelve cuántas cayeron. */
  invalidar(prefijo: string): number {
    let caidas = 0;
    for (const clave of this.store.keys()) {
      if (clave.startsWith(prefijo)) {
        this.store.delete(clave);
        caidas += 1;
      }
    }
    if (caidas > 0) this.logger.debug(`Invalidadas ${caidas} entrada(s) de "${prefijo}"`);
    return caidas;
  }

  /** Para el endpoint de salud: sirve para ver si la caché está sirviendo de algo. */
  estado() {
    return { entradas: this.store.size, enVuelo: this.enVuelo.size, maximo: MAXIMO };
  }

  private guardar(clave: string, valor: unknown, ttlMs: number) {
    // El Map conserva el orden de inserción, así que la primera clave es la
    // más antigua. Es un desalojo tosco —no mira uso, sólo edad— pero con un
    // catálogo de este tamaño el tope no se roza nunca.
    if (this.store.size >= MAXIMO) {
      const masVieja = this.store.keys().next().value;
      if (masVieja !== undefined) this.store.delete(masVieja);
    }
    this.store.set(clave, { valor, expira: Date.now() + ttlMs });
  }

  private limpiar() {
    const ahora = Date.now();
    for (const [clave, entrada] of this.store) {
      if (entrada.expira <= ahora) this.store.delete(clave);
    }
  }
}
