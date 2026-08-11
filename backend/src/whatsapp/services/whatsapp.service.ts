import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { WhatsappLinkDto } from '../dto';
import { WhatsappContext, WhatsappLink } from '../interfaces/whatsapp-link.interface';

/**
 * Genera enlaces wa.me para contacto directo cliente ↔ anfitrión.
 * El mensaje se arma en el backend para mantener una única plantilla,
 * y la interfaz queda lista para conectar WhatsApp Business API más adelante
 * (bastaría con añadir un método `sendTemplate()` a este servicio).
 */
@Injectable()
export class WhatsappService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** Deja sólo dígitos y antepone el código de Perú si falta. */
  normalizePhone(raw?: string | null): string {
    const digits = (raw ?? '').replace(/\D/g, '');
    if (!digits) return this.config.get<string>('whatsapp.defaultPhone') ?? '';
    if (digits.length === 9) return `51${digits}`;
    return digits;
  }

  buildMessage(ctx: WhatsappContext): string {
    const lines = [
      `Hola${ctx.guestName ? ` ${ctx.guestName}` : ''}, estoy interesado en el alojamiento "${ctx.propertyTitle}" ubicado en ${ctx.location}.`,
    ];

    if (ctx.checkIn && ctx.checkOut) {
      lines.push(`Fechas: del ${this.formatDate(ctx.checkIn)} al ${this.formatDate(ctx.checkOut)}.`);
    }
    if (ctx.guests) {
      lines.push(`Huéspedes: ${ctx.guests}.`);
    }
    lines.push('Quisiera consultar disponibilidad. ¡Gracias!');

    return lines.join('\n');
  }

  buildLink(phone: string, message: string): WhatsappLink {
    const baseUrl = this.config.get<string>('whatsapp.baseUrl') ?? 'https://wa.me';
    return {
      phone,
      message,
      url: `${baseUrl}/${phone}?text=${encodeURIComponent(message)}`,
    };
  }

  async forProperty(propertyId: string, dto: WhatsappLinkDto): Promise<WhatsappLink> {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
      select: {
        title: true,
        whatsappPhone: true,
        location: {
          select: { department: { select: { name: true } }, province: { select: { name: true } } },
        },
      },
    });
    if (!property) throw new NotFoundException('Alojamiento no encontrado');

    const location = `${property.location.province.name}, ${property.location.department.name}`;
    const message = this.buildMessage({
      propertyTitle: property.title,
      location,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      guests: dto.guests,
    });

    return this.buildLink(this.normalizePhone(property.whatsappPhone), message);
  }

  /** Enlace genérico de soporte para la página de contacto. */
  support(): WhatsappLink {
    return this.buildLink(
      this.normalizePhone(null),
      'Hola, necesito ayuda con una reserva en Airbnb PyFGroup.',
    );
  }

  private formatDate(value: string): string {
    return new Date(value).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }
}
