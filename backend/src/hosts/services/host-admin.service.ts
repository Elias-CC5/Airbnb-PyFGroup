import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HostApplicationStatus, HostStatus, Prisma, PropertyStatus, Role, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
import { ReviewHostApplicationDto, SuspendHostDto } from '../dto/host.dto';

/**
 * Lo que ve el administrador de una solicitud SIN pedir los documentos.
 * Los campos de identidad se sirven aparte, con bitácora, para que consultarlos
 * sea una decisión explícita y quede registrada.
 */
const RESUMEN_SOLICITUD = {
  id: true,
  status: true,
  fullName: true,
  phone: true,
  occupation: true,
  motivation: true,
  city: true,
  documentType: true,
  submittedAt: true,
  reviewedAt: true,
  rejectionReason: true,
  documentsPurgedAt: true,
  user: { select: { id: true, email: true, firstName: true, lastName: true, createdAt: true } },
  reviewedBy: { select: { id: true, email: true } },
} satisfies Prisma.HostApplicationSelect;

@Injectable()
export class HostAdminService {
  private readonly logger = new Logger(HostAdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // ------------------------------ solicitudes ------------------------------

  async applications(status?: HostApplicationStatus, page = 1, limit = 20) {
    const where: Prisma.HostApplicationWhereInput = status ? { status } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.hostApplication.findMany({
        where,
        select: RESUMEN_SOLICITUD,
        orderBy: [{ status: 'asc' }, { submittedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.hostApplication.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async application(id: string) {
    const solicitud = await this.prisma.hostApplication.findUnique({
      where: { id },
      select: RESUMEN_SOLICITUD,
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
    return solicitud;
  }

  /**
   * Documentos de identidad. Cada consulta queda registrada: es la única
   * forma de poder responder después quién vio el DNI de alguien.
   */
  async documents(applicationId: string, viewerId: string, ip?: string) {
    const solicitud = await this.prisma.hostApplication.findUnique({
      where: { id: applicationId },
      select: {
        documentType: true,
        documentNumber: true,
        documentFrontUrl: true,
        documentBackUrl: true,
        selfieUrl: true,
        documentsPurgedAt: true,
      },
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    await this.prisma.hostDocumentAccess.create({
      data: { applicationId, viewedById: viewerId, ip: ip?.slice(0, 45) },
    });
    this.logger.log(`Documentos de ${applicationId} consultados por ${viewerId}`);

    return solicitud;
  }

  /** Historial de consultas a los documentos de una solicitud. */
  accessLog(applicationId: string) {
    return this.prisma.hostDocumentAccess.findMany({
      where: { applicationId },
      orderBy: { viewedAt: 'desc' },
      select: {
        viewedAt: true,
        ip: true,
        viewedBy: { select: { id: true, email: true } },
      },
    });
  }

  // ------------------------------- resolución ------------------------------

  async review(id: string, reviewerId: string, dto: ReviewHostApplicationDto) {
    const solicitud = await this.prisma.hostApplication.findUnique({
      where: { id },
      include: { user: { select: { email: true, firstName: true } } },
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    if (
      solicitud.status === HostApplicationStatus.APPROVED ||
      solicitud.status === HostApplicationStatus.REJECTED
    ) {
      throw new BadRequestException('Esta solicitud ya fue resuelta');
    }

    const aprobada = dto.status === HostApplicationStatus.APPROVED;
    if (!aprobada && !dto.rejectionReason) {
      throw new BadRequestException('Indica el motivo del rechazo: el solicitante lo va a leer');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.hostApplication.update({
        where: { id },
        data: {
          status: dto.status,
          reviewedAt: new Date(),
          reviewedById: reviewerId,
          rejectionReason: aprobada ? null : dto.rejectionReason,
          // Resuelta la solicitud, las fotos del documento ya no hacen falta.
          // Se conserva el número por si hay que auditar, no las imágenes.
          documentFrontUrl: null,
          documentBackUrl: null,
          selfieUrl: null,
          documentsPurgedAt: new Date(),
        },
      });

      await tx.hostProfile.update({
        where: { userId: solicitud.userId },
        data: aprobada
          ? { status: HostStatus.ACTIVE, hostSince: new Date() }
          : { status: HostStatus.REJECTED },
      });

      if (aprobada) {
        // El rol sube a HOST sólo al aprobar. Nunca antes.
        await tx.user.update({
          where: { id: solicitud.userId },
          data: { role: Role.HOST },
        });

        const perfil = await tx.hostProfile.findUnique({
          where: { userId: solicitud.userId },
          select: { id: true },
        });
        if (perfil) {
          await tx.hostSettings.upsert({
            where: { hostProfileId: perfil.id },
            update: {},
            create: { hostProfileId: perfil.id },
          });
        }
      }
    });

    await this.avisarSolicitante(
      solicitud.user.email,
      solicitud.user.firstName,
      aprobada,
      dto.rejectionReason,
    );

    return { id, status: dto.status, reviewedAt: new Date() };
  }

  // ------------------------------- anfitriones -----------------------------

  async hosts(status?: HostStatus, page = 1, limit = 20) {
    const where: Prisma.HostProfileWhereInput = status ? { status } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.hostProfile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          displayName: true,
          city: true,
          status: true,
          hostSince: true,
          ratingAvg: true,
          reviewsCount: true,
          propertiesCount: true,
          suspendedReason: true,
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          /**
           * Último plan activo, para que el administrador vea de un vistazo
           * cuándo caduca. No se fuerza el vencimiento perezoso aquí: si
           * `endsAt` ya pasó, la interfaz lo muestra como vencido, y el repaso
           * diario se encarga de pausar las fichas.
           */
          subscriptions: {
            where: { status: SubscriptionStatus.ACTIVE },
            orderBy: { endsAt: 'desc' },
            take: 1,
            select: {
              id: true,
              startsAt: true,
              endsAt: true,
              plan: { select: { name: true, days: true } },
            },
          },
        },
      }),
      this.prisma.hostProfile.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async suspend(hostProfileId: string, dto: SuspendHostDto) {
    const perfil = await this.buscarPerfil(hostProfileId);

    await this.prisma.$transaction([
      this.prisma.hostProfile.update({
        where: { id: hostProfileId },
        data: {
          status: HostStatus.SUSPENDED,
          suspendedAt: new Date(),
          suspendedReason: dto.reason,
        },
      }),
      // Sus alojamientos salen del catálogo mientras dure la suspensión.
      this.prisma.property.updateMany({
        where: { ownerId: perfil.userId, deletedAt: null },
        data: { status: PropertyStatus.PAUSED },
      }),
    ]);

    return { id: hostProfileId, status: HostStatus.SUSPENDED };
  }

  async reactivate(hostProfileId: string) {
    const perfil = await this.buscarPerfil(hostProfileId);
    if (perfil.status !== HostStatus.SUSPENDED) {
      throw new BadRequestException('Este anfitrión no está suspendido');
    }

    await this.prisma.hostProfile.update({
      where: { id: hostProfileId },
      data: { status: HostStatus.ACTIVE, suspendedAt: null, suspendedReason: null },
    });

    // Las fichas NO se republican solas: el anfitrión decide cuáles vuelven.
    return { id: hostProfileId, status: HostStatus.ACTIVE };
  }

  // -------------------------------- helpers --------------------------------

  private async buscarPerfil(id: string) {
    const perfil = await this.prisma.hostProfile.findUnique({ where: { id } });
    if (!perfil) throw new NotFoundException('Anfitrión no encontrado');
    return perfil;
  }

  private async avisarSolicitante(
    email: string,
    firstName: string,
    aprobada: boolean,
    motivo?: string,
  ) {
    try {
      await this.mail.send({
        to: email,
        subject: aprobada ? 'Ya eres anfitrión en PyFGroup' : 'Sobre tu solicitud de anfitrión',
        html: aprobada
          ? `<p>Hola ${firstName},</p>` +
            '<p>Tu solicitud fue aprobada. Ya puedes publicar tus alojamientos desde tu panel.</p>'
          : `<p>Hola ${firstName},</p>` +
            '<p>Por ahora no pudimos aprobar tu solicitud.</p>' +
            `<p><strong>Motivo:</strong> ${motivo ?? 'no especificado'}</p>` +
            '<p>Puedes corregir lo indicado y volver a enviarla.</p>',
      });
    } catch (error) {
      this.logger.warn(`No se pudo avisar a ${email}: ${error}`);
    }
  }
}
