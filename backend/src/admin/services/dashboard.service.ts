import { Injectable } from '@nestjs/common';
import { PropertyStatus, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

export interface DashboardStats {
  properties: { total: number; active: number; inactive: number };
  reservations: { total: number; pending: number; confirmed: number; completed: number; cancelled: number };
  users: { total: number; newThisMonth: number };
  revenue: { total: number; thisMonth: number; currency: string };
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async stats(): Promise<DashboardStats> {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const startOfNextMonth = new Date(startOfMonth);
    startOfNextMonth.setUTCMonth(startOfNextMonth.getUTCMonth() + 1);

    const [
      propertiesTotal,
      propertiesActive,
      reservationsTotal,
      pending,
      confirmed,
      completed,
      cancelled,
      usersTotal,
      usersNew,
      revenueAll,
      revenueMonth,
    ] = await this.prisma.$transaction([
      this.prisma.property.count({ where: { deletedAt: null } }),
      this.prisma.property.count({ where: { deletedAt: null, status: PropertyStatus.ACTIVE } }),
      this.prisma.reservation.count(),
      this.prisma.reservation.count({ where: { status: ReservationStatus.PENDING } }),
      this.prisma.reservation.count({ where: { status: ReservationStatus.CONFIRMED } }),
      this.prisma.reservation.count({ where: { status: ReservationStatus.COMPLETED } }),
      this.prisma.reservation.count({ where: { status: ReservationStatus.CANCELLED } }),
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null, createdAt: { gte: startOfMonth } } }),
      this.prisma.reservation.aggregate({
        where: { status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.COMPLETED] } },
        _sum: { totalPrice: true },
      }),
      // Ingresos del mes = estadías que ocurren este mes, NO reservas cargadas
      // este mes. Con datos importados, createdAt es la fecha de la importación
      // y metía el histórico completo dentro del mes en curso.
      this.prisma.reservation.aggregate({
        where: {
          status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.COMPLETED] },
          checkIn: { gte: startOfMonth, lt: startOfNextMonth },
        },
        _sum: { totalPrice: true },
      }),
    ]);

    return {
      properties: {
        total: propertiesTotal,
        active: propertiesActive,
        inactive: propertiesTotal - propertiesActive,
      },
      reservations: { total: reservationsTotal, pending, confirmed, completed, cancelled },
      users: { total: usersTotal, newThisMonth: usersNew },
      revenue: {
        total: Number(revenueAll._sum.totalPrice ?? 0),
        thisMonth: Number(revenueMonth._sum.totalPrice ?? 0),
        currency: 'PEN',
      },
    };
  }

  /** Serie mensual de reservas e ingresos de los últimos N meses (para los gráficos). */
  async monthlySeries(months = 12) {
    const from = new Date();
    from.setUTCMonth(from.getUTCMonth() - (months - 1));
    from.setUTCDate(1);
    from.setUTCHours(0, 0, 0, 0);

    // Se agrupa por check_in (cuándo se ocupa el alojamiento), no por created_at
    // (cuándo se cargó el registro): si no, una importación masiva apila todo
    // el histórico en el mes en que se subió el archivo.
    const rows = await this.prisma.$queryRaw<Array<{ month: Date; reservations: bigint; revenue: string }>>`
      SELECT date_trunc('month', "check_in") AS month,
             COUNT(*)                        AS reservations,
             COALESCE(SUM(CASE WHEN status IN ('CONFIRMED','COMPLETED') THEN "total_price" ELSE 0 END), 0) AS revenue
      FROM reservations
      WHERE "check_in" >= ${from} AND status <> 'CANCELLED'
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    return rows.map((r) => ({
      month: r.month.toISOString().slice(0, 7),
      reservations: Number(r.reservations),
      revenue: Number(r.revenue),
    }));
  }

  /**
   * Rendimiento por alojamiento en un rango de fechas: ingresos, noches y
   * estadías. Es el equivalente en la web del cuadro "por departamento" que el
   * equipo llevaba a mano en el Excel de ocupación.
   */
  async propertyPerformance(from: string, to: string) {
    const start = new Date(`${from}T00:00:00Z`);
    const end = new Date(`${to}T00:00:00Z`);

    const rows = await this.prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        slug: string;
        reservations: bigint;
        nights: bigint;
        revenue: string;
      }>
    >`
      SELECT p.id,
             p.title,
             p.slug,
             COUNT(r.id)                        AS reservations,
             COALESCE(SUM(r.nights), 0)         AS nights,
             COALESCE(SUM(CASE WHEN r.status IN ('CONFIRMED','COMPLETED') THEN r."total_price" ELSE 0 END), 0) AS revenue
      FROM properties p
      JOIN reservations r ON r."property_id" = p.id
      WHERE p."deleted_at" IS NULL
        AND r.status <> 'CANCELLED'
        AND r."check_in" >= ${start}
        AND r."check_in" <  ${end}
      GROUP BY p.id, p.title, p.slug
      ORDER BY revenue DESC
    `;

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      reservations: Number(r.reservations),
      nights: Number(r.nights),
      revenue: Number(r.revenue),
      avgPerNight: Number(r.nights) > 0 ? Number(r.revenue) / Number(r.nights) : 0,
    }));
  }

  /** Reservas e ingresos por canal de venta, para los gráficos del panel. */
  async channelSeries(months = 12) {
    const from = new Date();
    from.setUTCMonth(from.getUTCMonth() - (months - 1));
    from.setUTCDate(1);
    from.setUTCHours(0, 0, 0, 0);

    const rows = await this.prisma.$queryRaw<
      Array<{ month: Date; channel: string; reservations: bigint; revenue: string }>
    >`
      SELECT date_trunc('month', "check_in") AS month,
             channel::text                   AS channel,
             COUNT(*)                        AS reservations,
             COALESCE(SUM(CASE WHEN status IN ('CONFIRMED','COMPLETED') THEN "total_price" ELSE 0 END), 0) AS revenue
      FROM reservations
      WHERE "check_in" >= ${from} AND status <> 'CANCELLED'
      GROUP BY 1, 2
      ORDER BY 1 ASC
    `;

    return rows.map((r) => ({
      month: r.month.toISOString().slice(0, 7),
      channel: r.channel,
      reservations: Number(r.reservations),
      revenue: Number(r.revenue),
    }));
  }

  /** Alojamientos más vistos / mejor valorados. */
  topProperties(limit = 5) {
    return this.prisma.property.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        ratingAvg: true,
        reviewsCount: true,
        pricePerNight: true,
        images: { where: { isMain: true }, take: 1, select: { url: true } },
        _count: { select: { reservations: true } },
      },
      orderBy: [{ views: 'desc' }],
      take: limit,
    });
  }

  /** Nuevos usuarios registrados por mes. */
  async usersSeries(months = 12) {
    const from = new Date();
    from.setUTCMonth(from.getUTCMonth() - (months - 1));

    const rows = await this.prisma.$queryRaw<Array<{ month: Date; total: bigint }>>`
      SELECT date_trunc('month', "created_at") AS month, COUNT(*) AS total
      FROM users
      WHERE "created_at" >= ${from} AND "deleted_at" IS NULL
      GROUP BY 1 ORDER BY 1 ASC
    `;

    return rows.map((r) => ({ month: r.month.toISOString().slice(0, 7), total: Number(r.total) }));
  }

  recentReservations(limit = 8) {
    return this.prisma.reservation.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        property: { select: { title: true, slug: true } },
      },
    });
  }
}
