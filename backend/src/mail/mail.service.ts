import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface MailAttachment {
  filename: string;
  /** Contenido ya decodificado. */
  content: Buffer;
  contentType?: string;
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: MailAttachment[];
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const host = this.config.get<string>('mail.host');

    if (!host) {
      this.logger.warn(
        'SMTP no configurado (falta SMTP_HOST). Los correos no se enviarán; ' +
          'en desarrollo se devolverá el token de recuperación en la respuesta.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: this.config.get<number>('mail.port'),
      secure: this.config.get<boolean>('mail.secure'),
      auth: {
        user: this.config.get<string>('mail.user'),
        pass: this.config.get<string>('mail.password'),
      },
    });

    this.transporter
      .verify()
      .then(() => this.logger.log(`SMTP conectado a ${host}`))
      .catch((e: Error) => this.logger.error(`No se pudo conectar al SMTP: ${e.message}`));
  }

  /** true cuando hay un transporte SMTP configurado. */
  get isEnabled(): boolean {
    return this.transporter !== null;
  }

  /**
   * Destinatarios fijos de los avisos internos, tomados de `MAIL_ADMIN_TO`.
   * Vacío significa "no hay lista": quien llama debe caer a los admins de la
   * base de datos. Se separa aquí para que ese criterio viva en un solo sitio.
   */
  get adminRecipients(): string[] {
    return this.config.get<string[]>('mail.adminTo') ?? [];
  }

  /**
   * Envía un correo. Nunca lanza: si falla, lo registra y devuelve false,
   * para que un problema de SMTP no rompa el flujo de negocio.
   */
  async send({ to, subject, html, text, attachments }: MailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`Correo NO enviado a ${to} ("${subject}"): SMTP deshabilitado`);
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.config.get<string>('mail.from'),
        replyTo: this.config.get<string>('mail.replyTo'),
        to,
        subject,
        html,
        text: text ?? this.htmlToText(html),
        attachments,
      });
      this.logger.log(`Correo enviado a ${to} (id: ${info.messageId})`);
      return true;
    } catch (e) {
      this.logger.error(`Error enviando correo a ${to}: ${(e as Error).message}`);
      return false;
    }
  }

  // ------------------------- plantillas -------------------------

  async sendPasswordReset(to: string, firstName: string, resetUrl: string): Promise<boolean> {
    return this.send({
      to,
      subject: 'Restablece tu contraseña — Wasi Perú',
      html: this.layout(
        `
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1a1a1a;">
          Hola ${this.escape(firstName)},
        </h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4a4a4a;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en Wasi Perú.
          Haz clic en el botón para crear una nueva:
        </p>
        <p style="margin:0 0 24px;text-align:center;">
          <a href="${resetUrl}"
             style="display:inline-block;padding:13px 28px;border-radius:10px;background:#b4553d;
                    color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
            Restablecer contraseña
          </a>
        </p>
        <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#6b6b6b;">
          Este enlace vence en <strong>1 hora</strong> y solo puede usarse una vez.
        </p>
        <p style="margin:0 0 20px;font-size:13px;line-height:1.6;color:#6b6b6b;">
          Si no solicitaste este cambio, puedes ignorar este correo: tu contraseña seguirá siendo la misma.
        </p>
        <p style="margin:0;font-size:12px;line-height:1.6;color:#9a9a9a;word-break:break-all;">
          ¿El botón no funciona? Copia y pega este enlace en tu navegador:<br />
          <a href="${resetUrl}" style="color:#b4553d;">${resetUrl}</a>
        </p>
        `,
      ),
      text:
        `Hola ${firstName},\n\n` +
        `Recibimos una solicitud para restablecer tu contraseña en Wasi Perú.\n` +
        `Abre este enlace para crear una nueva (vence en 1 hora):\n\n${resetUrl}\n\n` +
        `Si no solicitaste este cambio, ignora este correo.`,
    });
  }

  async sendWelcome(to: string, firstName: string): Promise<boolean> {
    return this.send({
      to,
      subject: '¡Bienvenido a Wasi Perú!',
      html: this.layout(`
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1a1a1a;">
          ¡Bienvenido, ${this.escape(firstName)}!
        </h1>
        <p style="margin:0;font-size:15px;line-height:1.6;color:#4a4a4a;">
          Tu cuenta ya está lista. Explora alojamientos en todo el Perú y reserva tu próxima estadía.
        </p>
      `),
    });
  }

  // ------------------------- helpers -------------------------

  private layout(content: string): string {
    return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px 12px;background:#f6f4f1;
               font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="max-width:520px;border-collapse:collapse;background:#ffffff;
                        border-radius:16px;border:1px solid #e8e3dd;overflow:hidden;">
            <tr>
              <td style="padding:20px 32px;border-bottom:1px solid #f0ece7;">
                <span style="font-size:16px;font-weight:700;color:#b4553d;letter-spacing:-0.2px;">Wasi Perú</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">${content}</td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#faf8f6;border-top:1px solid #f0ece7;">
                <p style="margin:0;font-size:11px;line-height:1.5;color:#9a9a9a;">
                  Este es un correo automático, por favor no respondas a este mensaje.<br />
                  © ${new Date().getFullYear()} Wasi Perú
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }

  private escape(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
