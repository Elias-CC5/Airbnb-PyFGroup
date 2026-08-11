import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService);

  const port = config.get<number>('app.port') ?? 4000;
  const prefix = config.get<string>('app.apiPrefix') ?? 'api/v1';
  const origins = config.get<string[]>('app.corsOrigins') ?? [];
  const isDev = config.get<string>('app.env') !== 'production';

  app.setGlobalPrefix(prefix, { exclude: ['health'] });

  // ---------------------------- seguridad ----------------------------
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());

  // Se registra en el log para poder diagnosticar qué .env se cargó realmente.
  logger.log(`CORS permitido para: ${origins.join(', ') || '(ninguno)'}`);

  app.enableCors({
    origin: (origin, callback) => {
      // Herramientas sin origin (Postman, curl, SSR del propio frontend).
      if (!origin) return callback(null, true);

      if (origins.includes(origin)) return callback(null, true);

      // En desarrollo aceptamos cualquier puerto de localhost (3000, 3001, ...),
      // así cambiar de puerto no rompe el frontend.
      if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Rechazo limpio: se omiten las cabeceras CORS, sin lanzar un 500.
      logger.warn(`Origen bloqueado por CORS: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 204,
  });

  // -------------------------- validación DTO --------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // y rechaza la petición si las envía
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // ----------------------------- Swagger ------------------------------
  if (isDev) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Airbnb PyFGroup')
      .setDescription('API REST de la plataforma de alquiler de alojamientos en Perú')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addTag('Auth')
      .addTag('Properties')
      .addTag('Reservations')
      .build();

    SwaggerModule.setup(`${prefix}/docs`, app, SwaggerModule.createDocument(app, swaggerConfig), {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  app.enableShutdownHooks();
  await app.listen(port, '0.0.0.0');

  logger.log(`API escuchando en http://localhost:${port}/${prefix}`);
  logger.log(`Documentación Swagger en http://localhost:${port}/${prefix}/docs`);
}

void bootstrap();