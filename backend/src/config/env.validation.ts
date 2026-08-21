import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

const toInt = () => Transform(({ value }) => (value === undefined ? undefined : parseInt(value, 10)));
const toBool = () => Transform(({ value }) => value === 'true' || value === true);

/**
 * Valida las variables de entorno al arrancar la aplicación.
 * Si falta un secreto crítico, la app NO levanta (fail fast).
 */
export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @toInt()
  PORT = 4000;

  @IsString()
  API_PREFIX = 'api/v1';

  @IsString()
  FRONTEND_URL: string;

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  @MinLength(24, { message: 'JWT_SECRET debe tener al menos 24 caracteres' })
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN = '15m';

  @IsString()
  @MinLength(24, { message: 'JWT_REFRESH_SECRET debe tener al menos 24 caracteres' })
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN = '7d';

  @IsBoolean()
  @toBool()
  @IsOptional()
  COOKIE_SECURE = false;

  @IsInt()
  @toInt()
  @IsOptional()
  THROTTLE_TTL = 60;

  @IsInt()
  @toInt()
  @IsOptional()
  THROTTLE_LIMIT = 120;

  @IsString()
  @IsOptional()
  STORAGE_DRIVER = 'local';

  @IsInt()
  @toInt()
  @IsOptional()
  MAX_UPLOAD_SIZE_MB = 5;

  @IsString()
  @IsOptional()
  WHATSAPP_DEFAULT_PHONE?: string;

  // ------------------------- SMTP / correo -------------------------
  // Todas opcionales: si SMTP_HOST está vacío, el envío queda deshabilitado
  // y en desarrollo el token de recuperación vuelve en la respuesta.
  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsInt()
  @toInt()
  @IsOptional()
  SMTP_PORT = 587;

  @IsBoolean()
  @toBool()
  @IsOptional()
  SMTP_SECURE = false;

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASSWORD?: string;

  @IsString()
  @IsOptional()
  MAIL_FROM?: string;

  @IsString()
  @IsOptional()
  MAIL_REPLY_TO?: string;

  /**
   * Destinatarios de los avisos internos (pagos por verificar, solicitudes de
   * anfitrión), separados por comas. Si queda vacía se avisa a todos los
   * usuarios con rol ADMIN o SUPER_ADMIN, que es el comportamiento anterior.
   */
  @IsString()
  @IsOptional()
  MAIL_ADMIN_TO?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
    exposeDefaultValues: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors
      .map((e) => `  · ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n');
    throw new Error(`Variables de entorno inválidas:\n${details}`);
  }

  return validated;
}
