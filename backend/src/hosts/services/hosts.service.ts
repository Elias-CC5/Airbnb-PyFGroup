import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  HostApplicationStatus,
  HostProfile,
  HostStatus,
  IdDocumentType,
  Prisma,
  Role,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
import { CreateHostApplicationDto, UpdateHostProfileDto } from '../dto/host.dto';

/**
 * Campos del perfil que sí pueden salir al público. Todo lo demás —y sobre
 * todo cualquier cosa de la solicitud— se queda dentro.
 */
export const PUBLIC_HOST_FIELDS = {
  id: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  coverUrl: true,
  city: true,
  country: true,
  languages: true,
  hostSince: true,
  ratingAvg: true,
  reviewsCount: true,
  propertiesCount: true,
} satisfies Prisma.HostProfileSelect;

/** Estados en los que una solicitud sigue abierta. */
const EN_REVISION: HostApplicationStatus[] = [
  HostApplicationStatus.SUBMITTED,
  HostApplicationStatus.UNDER_REVIEW,
];

@Injectable()
export class HostsService {
  private readonly logger = new Logger(HostsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // ---------------------------- lado del usuario ----------------------------

  /** Estado del usuario respecto al programa de anfitriones. */
  async myStatus(userId: string) {
    const [profile, application] = await Promise.all([
      this.prisma.hostProfile.findUnique({
        where: { userId },
        include: { settings: true },
      }),
      this.prisma.hostApplication.findFirst({
        where: { userId },
        orderBy: { submittedAt: 'desc' },
        // Nunca se devuelven los campos de identidad al propio usuario:
        // no los necesita y así no viajan de más.
        select: {
          id: true,
          status: true,
          submittedAt: true,
          reviewedAt: true,
          rejectionReason: true,
        },
      }),
    ]);

    return {
      isHost: profile?.status === HostStatus.ACTIVE,
      profile: profile ? this.publicView(profile) : null,
      status: profile?.status ?? null,
      application,
      canApply: this.canApply(profile, application?.status),
    };
  }

  /** Registra la solicitud y avisa al administrador. */
  async apply(userId: string, dto: CreateHostApplicationDto) {
    const [profile, ultima] = await Promise.all([
      this.prisma.hostProfile.findUnique({ where: { userId } }),
      this.prisma.hostApplication.findFirst({
        where: { userId },
        orderBy: { submittedAt: 'desc' },
      }),
    ]);

    if (profile?.status === HostStatus.ACTIVE) {
      throw new ConflictException('Ya eres anfitrión');
    }
    if (profile?.status === HostStatus.SUSPENDED) {
      throw new ConflictException(
        'Tu cuenta de anfitrión está suspendida. Escríbenos para revisarla.',
      );
    }
    if (ultima && EN_REVISION.includes(ultima.status)) {
      throw new ConflictException('Ya tienes una solicitud en revisión');
    }

    const documento = dto.documentNumber.replace(/\s+/g, '');
    if (dto.documentType === IdDocumentType.DNI && !/^\d{8}$/.test(documento)) {
      throw new BadRequestException('El DNI debe tener 8 dígitos');
    }

    const application = await this.prisma.$transaction(async (tx) => {
      const creada = await tx.hostApplication.create({
        data: {
          userId,
          fullName: dto.fullName,
          phone: dto.phone,
          occupation: dto.occupation,
          motivation: dto.motivation,
          city: dto.city,
          documentType: dto.documentType,
          documentNumber: documento,
          documentFrontUrl: dto.documentFrontUrl,
          documentBackUrl: dto.documentBackUrl,
          selfieUrl: dto.selfieUrl,
        },
      });

      // El perfil nace en PENDING: existe, pero todavía no habilita nada.
      await tx.hostProfile.upsert({
        where: { userId },
        update: { status: HostStatus.PENDING },
        create: {
          userId,
          displayName: dto.fullName.split(' ')[0] || 'Anfitrión',
          city: dto.city,
          whatsapp: dto.phone,
          status: HostStatus.PENDING,
        },
      });

      return creada;
    });

    await this.avisarAdministradores(application.id, dto.fullName);

    return {
      id: application.id,
      status: application.status,
      submittedAt: application.submittedAt,
      message: 'Solicitud enviada. Te avisaremos por correo cuando la revisemos.',
    };
  }

  /** Perfil propio, con los campos operativos que el público no ve. */
  async myProfile(userId: string) {
    const profile = await this.prisma.hostProfile.findUnique({
      where: { userId },
      include: { settings: true },
    });
    if (!profile) throw new NotFoundException('Todavía no tienes perfil de anfitrión');
    return profile;
  }

  async updateMyProfile(userId: string, dto: UpdateHostProfileDto) {
    const profile = await this.prisma.hostProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Todavía no tienes perfil de anfitrión');

    return this.prisma.hostProfile.update({ where: { userId }, data: { ...dto } });
  }

  // ----------------------------- lado público ------------------------------

  /** Perfil visible para cualquiera. Sólo anfitriones activos. */
  async publicProfile(id: string) {
    const profile = await this.prisma.hostProfile.findFirst({
      where: { id, status: HostStatus.ACTIVE },
      select: PUBLIC_HOST_FIELDS,
    });
    if (!profile) throw new NotFoundException('Anfitrión no encontrado');
    return profile;
  }

  // -------------------------------- helpers --------------------------------

  /** Recorta el perfil a lo publicable. Evita filtrar campos por descuido. */
  private publicView(profile: HostProfile) {
    const permitidos = new Set([...Object.keys(PUBLIC_HOST_FIELDS), 'status']);
    return Object.fromEntries(
      Object.entries(profile).filter(([clave]) => permitidos.has(clave)),
    );
  }

  private canApply(profile: HostProfile | null, estado?: HostApplicationStatus): boolean {
    if (profile?.status === HostStatus.ACTIVE) return false;
    if (profile?.status === HostStatus.SUSPENDED) return false;
    if (estado && EN_REVISION.includes(estado)) return false;
    return true;
  }

  /** Correo a los administradores. Si el envío falla, la solicitud igual queda. */
  private async avisarAdministradores(applicationId: string, nombre: string) {
    try {
      // MAIL_ADMIN_TO manda si está definida; si no, los admins de la base.
      const fijos = this.mail.adminRecipients;
      const admins = fijos.length
        ? fijos.map((email) => ({ email, firstName: null as string | null }))
        : await this.prisma.user.findMany({
            where: {
              role: { in: [Role.ADMIN, Role.SUPER_ADMIN] },
              deletedAt: null,
              isActive: true,
            },
            select: { email: true, firstName: true },
          });

      await Promise.all(
        admins.map((admin) =>
          this.mail.send({
            to: admin.email,
            subject: 'Nueva solicitud de anfitrión',
            html:
              `<p>Hola ${admin.firstName ?? ''},</p>` +
              `<p><strong>${nombre}</strong> quiere publicar alojamientos en la plataforma.</p>` +
              `<p>Revisa su solicitud en el panel, en Anfitriones → Solicitudes.</p>`,
          }),
        ),
      );
    } catch (error) {
      this.logger.warn(`No se pudo avisar a los administradores de ${applicationId}: ${error}`);
    }
  }
}
