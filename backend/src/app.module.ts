import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AdminModule } from './admin/admin.module';
import { AmenitiesModule } from './amenities/amenities.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AvailabilityModule } from './availability/availability.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonModule } from './common/common.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { appConfig, jwtConfig, storageConfig, validateEnv, whatsappConfig } from './config';
import { ComplaintsModule } from './complaints/complaints.module';
import { DatabaseModule } from './database/database.module';
import { FavoritesModule } from './favorites/favorites.module';
import { LocationsModule } from './locations/locations.module';
import { PropertiesModule } from './properties/properties.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, jwtConfig, storageConfig, whatsappConfig],
      validate: validateEnv,
    }),

    // Rate limiting global (protección básica contra abuso de la API).
    ThrottlerModule.forRoot([
      {
        ttl: (Number(process.env.THROTTLE_TTL) || 60) * 1000,
        limit: Number(process.env.THROTTLE_LIMIT) || 120,
      },
    ]),

    // Sirve las imágenes cuando STORAGE_DRIVER=local.
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: { index: false, fallthrough: true },
    }),

    DatabaseModule,
    CommonModule,

    AuthModule,
    UsersModule,
    LocationsModule,
    CategoriesModule,
    AmenitiesModule,
    PropertiesModule,
    AvailabilityModule,
    ReservationsModule,
    ReviewsModule,
    FavoritesModule,
    UploadsModule,
    WhatsappModule,
    ComplaintsModule,
    AdminModule,
  ],
  providers: [
    // Autenticación por defecto en TODA la API; se abre con @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}