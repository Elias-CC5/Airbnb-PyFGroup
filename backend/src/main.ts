import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  // `bodyParser: false` desactiva el parser que Nest monta por su cuenta con un
  // tope de 100 kB. Sin esto, el body-parser interno se ejecuta ANTES que el
  // nuestro y revienta con PayloadTooLargeError: como no es una HttpException,
  // el filtro global la convierte en un 500 opaco en vez de un 413.
  const app = await NestFactory.create(AppModule, { bufferLogs: false, bodyParser: false });
  const config = app.get(ConfigService);

  const port = config.get<number>('app.port') ?? 4000;
  const prefix = config.get<string>('app.apiPrefix') ?? 'api/v1';
  const origins = config.get<string[]>('app.corsOrigins') ?? [];
  const isDev = config.get<string>('app.env') !== 'production';

  app.setGlobalPrefix(prefix, { exclude: ['health'] });

  // ---------------------------- seguridad ----------------------------
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());

  // La captura del pago viaja en base64 dentro del cuerpo, así que el tope
  // sube a 8 MB. Va aquí, antes de las rutas, porque es el único parser.
  app.use(express.json({ limit: '8mb' }));
  app.use(express.urlencoded({ limit: '8mb', extended: true }));

  // Se registra en el log para poder diagnosticar qué .env se cargó realmente.
  logger.log(`CORS permitido para: ${origins.join(', ') || '(ninguno)'}`);

  app.enableCors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (origins.includes(origin)) return callback(null, true);

    if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // Cualquier deploy (producción o preview) de tu proyecto en Vercel
    if (/^https:\/\/airbnb-py-f-group[a-z0-9-]*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

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
      .setTitle('PyFGroup')
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