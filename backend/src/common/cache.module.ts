import { Global, Module } from '@nestjs/common';
import { CacheService } from './services/cache.service';

/**
 * Global a propósito: la caché es una sola para todo el proceso y no tiene
 * sentido que cada módulo cree la suya —serían cachés separadas que no se
 * invalidan entre ellas, que es peor que no tener caché.
 */
@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
