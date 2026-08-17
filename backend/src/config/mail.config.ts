import { registerAs } from '@nestjs/config';

/**
 * Configuración SMTP. Si SMTP_HOST está vacío el envío queda deshabilitado
 * y el backend cae al modo desarrollo (devuelve el token en la respuesta).
 */
export default registerAs('mail', () => ({
  host: process.env.SMTP_HOST ?? '',
  port: parseInt(process.env.SMTP_PORT ?? '587', 10),
  // true solo para el puerto 465 (SMTPS). En 587 va false (usa STARTTLS).
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER ?? '',
  password: process.env.SMTP_PASSWORD ?? '',
  from: process.env.MAIL_FROM ?? 'Wasi Perú <no-reply@wasi.pe>',
  replyTo: process.env.MAIL_REPLY_TO || undefined,
}));
