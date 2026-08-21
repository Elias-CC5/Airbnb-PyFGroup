import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  HostStatus,
  PaymentMethod,
  PropertyStatus,
  Role,
  SubscriptionStatus,
} from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
import { ReportPaymentDto, ReviewPaymentDto, SubscribeDto } from '../dto/subscription.dto';

/** Alojamientos publicables sin pagar nada. */
export const FREE_PROPERTY_LIMIT = 1;

/** Estados que ocupan un cupo: un borrador todavía no compite por publicarse. */
const ESTADOS_QUE_OCUPAN: PropertyStatus[] = [
  PropertyStatus.ACTIVE,
  PropertyStatus.PENDING,
  PropertyStatus.PENDING_REVIEW,
];

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // ------------------------------- planes --------------------------------
  plans() {
    return this.prisma.hostPlan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { days: 'asc' }],
    });
  }

  // --------------------------- estado del anfitrión ----------------------
  /**
   * Suscripción vigente, si la hay. Antes de responder cierra las que ya
   * vencieron: así el vencimiento no depende de que un cron haya corrido.
   */
  async currentSubscription(hostProfileId: string) {
    await this.expireIfDue(hostProfileId);

    return this.prisma.hostSubscription.findFirst({
      where: { hostProfileId, status: SubscriptionStatus.ACTIVE },
      include: { plan: true },
      orderBy: { endsAt: 'desc' },
    });
  }

  /** Resumen para el panel: cupos, plan vigente y pago en curso. */
  async myPlan(userId: string) {
    const profile = await this.prisma.hostProfile.findUnique({
      where: { userId },
      select: { id: true, freeSlotPropertyId: true },
    });
    if (!profile) throw new NotFoundException('Todavía no tienes perfil de anfitrión');

    const [activa, pendiente, publicados, total] = await Promise.all([
      this.currentSubscription(profile.id),
      this.prisma.hostSubscription.findFirst({
        where: {
          hostProfileId: profile.id,
          status: { in: [SubscriptionStatus.PENDING_PAYMENT, SubscriptionStatus.IN_REVIEW] },
        },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({
        where: { ownerId: userId, deletedAt: null, status: { in: ESTADOS_QUE_OCUPAN } },
      }),
      this.prisma.property.count({ where: { ownerId: userId, deletedAt: null } }),
    ]);

    return {
      isSubscribed: Boolean(activa),
      subscription: activa,
      pending: pendiente,
      properties: { published: publicados, total },
      freeLimit: FREE_PROPERTY_LIMIT,
      // Sin plan sólo queda el cupo gratuito; con plan, ilimitado.
      slotsLeft: activa ? null : Math.max(0, FREE_PROPERTY_LIMIT - publicados),
      freeSlotPropertyId: profile.freeSlotPropertyId,
    };
  }

  // ------------------------------- límite --------------------------------
  /**
   * Se llama antes de crear o publicar un alojamiento. Los administradores no
   * tienen límite; un anfitrión sin plan sólo puede tener uno publicado.
   */
  async assertCanPublish(user: AuthenticatedUser, excludePropertyId?: string) {
    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) return;

    const profile = await this.prisma.hostProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) throw new ForbiddenException('Necesitas ser anfitrión para publicar');

    const activa = await this.currentSubscription(profile.id);
    if (activa) return;

    const publicados = await this.prisma.property.count({
      where: {
        ownerId: user.id,
        deletedAt: null,
        status: { in: ESTADOS_QUE_OCUPAN },
        ...(excludePropertyId ? { id: { not: excludePropertyId } } : {}),
      },
    });

    if (publicados >= FREE_PROPERTY_LIMIT) {
      throw new ForbiddenException(
        'Con el plan gratuito puedes tener un alojamiento publicado. ' +
          'Contrata un plan para publicar más.',
      );
    }
  }

  // ---------------------------- contratación -----------------------------
  async subscribe(userId: string, dto: SubscribeDto) {
    const profile = await this.prisma.hostProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Todavía no tienes perfil de anfitrión');
    if (profile.status === HostStatus.SUSPENDED) {
      throw new ForbiddenException('Tu cuenta está suspendida');
    }

    const plan = await this.prisma.hostPlan.findFirst({
      where: { id: dto.planId, isActive: true },
    });
    if (!plan) throw new NotFoundException('El plan no existe o ya no está disponible');

    const enCurso = await this.prisma.hostSubscription.findFirst({
      where: {
        hostProfileId: profile.id,
        status: { in: [SubscriptionStatus.PENDING_PAYMENT, SubscriptionStatus.IN_REVIEW] },
      },
    });
    if (enCurso) {
      throw new BadRequestException(
        'Ya tienes un pago en curso. Espera a que lo confirmemos o cancélalo.',
      );
    }

    return this.prisma.hostSubscription.create({
      data: {
        hostProfileId: profile.id,
        planId: plan.id,
        amount: plan.price,
        currency: plan.currency,
        status: SubscriptionStatus.PENDING_PAYMENT,
      },
      include: { plan: true },
    });
  }

  /** El anfitrión declara que ya pagó. No activa nada: sólo lo pone en revisión. */
  async reportPayment(userId: string, subscriptionId: string, dto: ReportPaymentDto) {
    const sub = await this.prisma.hostSubscription.findUnique({
      where: { id: subscriptionId },
      include: { hostProfile: { select: { userId: true } } },
    });

    if (!sub || sub.hostProfile.userId !== userId) {
      throw new NotFoundException('No encontramos esa suscripción');
    }
    if (sub.status !== SubscriptionStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Esta suscripción ya no admite reportar un pago');
    }
    if (dto.method === PaymentMethod.CASH) {
      // El efectivo sólo lo registra quien lo recibe: si el anfitrión pudiera
      // declararlo, se activaría solo sin que exista el dinero.
      throw new BadRequestException(
        'El pago en efectivo lo registra el equipo. Escríbenos para coordinarlo.',
      );
    }

    const actualizada = await this.prisma.hostSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.IN_REVIEW,
        method: dto.method,
        operationNumber: dto.operationNumber,
        proofUrl: dto.proofUrl,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
        reportedAt: new Date(),
      },
      include: { plan: true },
    });

    await this.notificarAdministradores(userId, actualizada.plan.name);
    return actualizada;
  }

  async cancelPending(userId: string, subscriptionId: string) {
    const sub = await this.prisma.hostSubscription.findUnique({
      where: { id: subscriptionId },
      include: { hostProfile: { select: { userId: true } } },
    });

    if (!sub || sub.hostProfile.userId !== userId) {
      throw new NotFoundException('No encontramos esa suscripción');
    }
    if (sub.status === SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('No puedes cancelar un plan que ya está activo');
    }

    return this.prisma.hostSubscription.update({
      where: { id: subscriptionId },
      data: { status: SubscriptionStatus.CANCELLED },
    });
  }

  /** El anfitrión elige qué ficha conserva cuando vuelve al plan gratuito. */
  async chooseFreeSlot(userId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId, deletedAt: null },
      select: { id: true },
    });
    if (!property) throw new NotFoundException('Ese alojamiento no es tuyo');

    return this.prisma.hostProfile.update({
      where: { userId },
      data: { freeSlotPropertyId: propertyId },
      select: { freeSlotPropertyId: true },
    });
  }

  // ------------------------------ vencimiento -----------------------------
  /**
   * Cierra las suscripciones vencidas y deja al anfitrión en el plan gratuito:
   * conserva publicado el alojamiento que él eligió (o el más antiguo) y pausa
   * el resto. Las reservas ya confirmadas no se tocan.
   */
  async expireIfDue(hostProfileId: string) {
    const vencidas = await this.prisma.hostSubscription.findMany({
      where: {
        hostProfileId,
        status: SubscriptionStatus.ACTIVE,
        endsAt: { lt: new Date() },
      },
      include: { hostProfile: { select: { userId: true, freeSlotPropertyId: true } } },
    });

    if (vencidas.length === 0) return;

    for (const sub of vencidas) {
      await this.prisma.hostSubscription.update({
        where: { id: sub.id },
        data: { status: SubscriptionStatus.EXPIRED },
      });
      await this.volverAlPlanGratuito(
        sub.hostProfile.userId,
        sub.hostProfile.freeSlotPropertyId,
      );
      this.logger.log(`Suscripción ${sub.id} vencida; anfitrión de vuelta al plan gratuito`);
    }
  }

  private async volverAlPlanGratuito(userId: string, freeSlotPropertyId: string | null) {
    const publicados = await this.prisma.property.findMany({
      where: { ownerId: userId, deletedAt: null, status: { in: ESTADOS_QUE_OCUPAN } },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    if (publicados.length <= FREE_PROPERTY_LIMIT) return;

    // El elegido, si sigue publicado; si no, el más antiguo.
    const conservar =
      publicados.find((p) => p.id === freeSlotPropertyId)?.id ?? publicados[0].id;

    await this.prisma.property.updateMany({
      where: { id: { in: publicados.filter((p) => p.id !== conservar).map((p) => p.id) } },
      data: { status: PropertyStatus.PAUSED },
    });
  }

  /** Repaso diario, como red de seguridad del control perezoso. */
  async expireAllDue() {
    const vencidas = await this.prisma.hostSubscription.findMany({
      where: { status: SubscriptionStatus.ACTIVE, endsAt: { lt: new Date() } },
      select: { hostProfileId: true },
      distinct: ['hostProfileId'],
    });

    for (const { hostProfileId } of vencidas) await this.expireIfDue(hostProfileId);
    return { revisadas: vencidas.length };
  }

  // ------------------------------ lado admin ------------------------------
  async pendingPayments(page = 1, limit = 20) {
    const where = {
      status: {
        in: [SubscriptionStatus.IN_REVIEW, SubscriptionStatus.PENDING_PAYMENT],
      },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.hostSubscription.findMany({
        where,
        include: {
          plan: true,
          hostProfile: {
            select: {
              id: true,
              displayName: true,
              user: { select: { id: true, email: true, firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { reportedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.hostSubscription.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  /**
   * Confirma o rechaza un pago. Al confirmar, si el anfitrión ya tenía un plan
   * vigente el nuevo periodo arranca donde termina el anterior: renovar antes
   * de tiempo no le cuesta días.
   */
  async reviewPayment(adminId: string, subscriptionId: string, dto: ReviewPaymentDto) {
    const sub = await this.prisma.hostSubscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true, hostProfile: { select: { id: true, userId: true } } },
    });
    if (!sub) throw new NotFoundException('No encontramos esa suscripción');
    if (sub.status === SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('Ese pago ya fue confirmado');
    }

    if (!dto.approve) {
      if (!dto.rejectionReason || dto.rejectionReason.trim().length < 10) {
        throw new BadRequestException('Indica el motivo del rechazo (mínimo 10 caracteres)');
      }

      const rechazada = await this.prisma.hostSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.REJECTED,
          reviewedAt: new Date(),
          reviewedById: adminId,
          rejectionReason: dto.rejectionReason.trim(),
          adminNotes: dto.adminNotes,
        },
      });

      await this.avisarAlAnfitrion(sub.hostProfile.userId, false, sub.plan.name, dto.rejectionReason);
      return rechazada;
    }

    const vigente = await this.prisma.hostSubscription.findFirst({
      where: { hostProfileId: sub.hostProfile.id, status: SubscriptionStatus.ACTIVE },
      orderBy: { endsAt: 'desc' },
    });

    const ahora = new Date();
    const arranque =
      vigente?.endsAt && vigente.endsAt > ahora ? new Date(vigente.endsAt) : ahora;
    const fin = new Date(arranque);
    fin.setUTCDate(fin.getUTCDate() + sub.plan.days);

    const confirmada = await this.prisma.$transaction(async (tx) => {
      const actualizada = await tx.hostSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.ACTIVE,
          startsAt: arranque,
          endsAt: fin,
          reviewedAt: ahora,
          reviewedById: adminId,
          method: dto.method ?? sub.method,
          adminNotes: dto.adminNotes,
        },
        include: { plan: true },
      });

      // Al recuperar el plan, vuelven las fichas que se habían pausado.
      await tx.property.updateMany({
        where: {
          ownerId: sub.hostProfile.userId,
          deletedAt: null,
          status: PropertyStatus.PAUSED,
        },
        data: { status: PropertyStatus.ACTIVE },
      });

      return actualizada;
    });

    await this.avisarAlAnfitrion(sub.hostProfile.userId, true, sub.plan.name);
    return confirmada;
  }

  /** Pago en efectivo: lo registra el administrador y queda activo al instante. */
  async registerCashPayment(adminId: string, hostProfileId: string, planId: string, notes?: string) {
    const [profile, plan] = await Promise.all([
      this.prisma.hostProfile.findUnique({ where: { id: hostProfileId } }),
      this.prisma.hostPlan.findUnique({ where: { id: planId } }),
    ]);
    if (!profile) throw new NotFoundException('No encontramos al anfitrión');
    if (!plan) throw new NotFoundException('No encontramos el plan');

    const creada = await this.prisma.hostSubscription.create({
      data: {
        hostProfileId,
        planId,
        amount: plan.price,
        currency: plan.currency,
        status: SubscriptionStatus.IN_REVIEW,
        method: PaymentMethod.CASH,
        paidAt: new Date(),
        reportedAt: new Date(),
        adminNotes: notes,
      },
    });

    return this.reviewPayment(adminId, creada.id, { approve: true, adminNotes: notes });
  }

  // ------------------------------- avisos ---------------------------------
  private async notificarAdministradores(userId: string, plan: string) {
    // Si MAIL_ADMIN_TO trae correos, mandamos sólo ahí. Sin esa variable se
    // avisa a todos los admins de la base, como se hacía antes.
    const fijos = this.mail.adminRecipients;

    const [usuario, admins] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      fijos.length
        ? Promise.resolve(fijos.map((email) => ({ email })))
        : this.prisma.user.findMany({
            where: { role: { in: [Role.ADMIN, Role.SUPER_ADMIN] }, deletedAt: null },
            select: { email: true },
          }),
    ]);

    const nombre = usuario ? `${usuario.firstName} ${usuario.lastName}` : 'Un anfitrión';

    for (const admin of admins) {
      await this.mail.send({
        to: admin.email,
        subject: 'Pago de anfitrión por verificar',
        html:
          `<p><strong>${nombre}</strong> reportó el pago del plan <strong>${plan}</strong>.</p>` +
          '<p>Revísalo en el panel, sección Anfitriones → Pagos.</p>',
      });
    }
  }

  private async avisarAlAnfitrion(
    userId: string,
    aprobado: boolean,
    plan: string,
    motivo?: string,
  ) {
    const usuario = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!usuario) return;

    await this.mail.send({
      to: usuario.email,
      subject: aprobado ? 'Tu plan está activo' : 'No pudimos confirmar tu pago',
      html: aprobado
        ? `<p>Hola ${usuario.firstName},</p><p>Confirmamos tu pago del plan <strong>${plan}</strong>. ` +
          'Ya puedes publicar todos los alojamientos que quieras.</p>'
        : `<p>Hola ${usuario.firstName},</p><p>No pudimos confirmar tu pago del plan ` +
          `<strong>${plan}</strong>.</p><p>${motivo ?? ''}</p>` +
          '<p>Puedes volver a reportarlo desde tu panel.</p>',
    });
  }
}
