import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BookingChannel, PropertyStatus, ReservationStatus, Role } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../../database/prisma.service';
import { PasswordService } from '../../auth/services/password.service';

/** Colores de la leyenda de la hoja → canal de venta. */
const RGB_CHANNEL: Record<string, BookingChannel> = {
  FF70AD47: BookingChannel.AIRBNB,
  FF92D050: BookingChannel.AIRBNB,
  FF00FFFF: BookingChannel.DIRECT,
  FF0000FF: BookingChannel.BOOKING,
  FFFFFF00: BookingChannel.EXPEDIA,
  FFD5A6BD: BookingChannel.TIKTOK,
  FFEAD1DC: BookingChannel.TIKTOK,
};

/** El tema 9 de Office (Accent6) es el verde que la hoja usa para Airbnb. */
const THEME_CHANNEL: Record<number, BookingChannel> = { 9: BookingChannel.AIRBNB };

/** Columnas donde empieza cada día: nombre, precio y estado van en tríos. */
const DAY_COLUMNS = [3, 6, 9, 12, 15, 18, 21];

/** Prefijos de tres letras admitidos en el nombre de la hoja. */
const MONTHS: Record<string, number> = {
  ene: 1,
  feb: 2,
  mar: 3,
  abr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  sep: 9,
  set: 9,
  oct: 10,
  nov: 11,
  dic: 12,
};

interface ParsedNight {
  dpto: string;
  date: string;
  guest: string;
  price: number | null;
  channel: BookingChannel;
  paymentCode: number | null;
}

export interface ImportSummary {
  sheets: Array<{ sheet: string; month: string; reservations: number }>;
  propertiesCreated: number;
  reservationsCreated: number;
  reservationsUpdated: number;
  skipped: string[];
}

/**
 * Importa la hoja de control de ocupación que el equipo mantiene en Excel.
 * Detecta los bloques semanales (fila "N° Dpto."), agrupa las noches
 * consecutivas del mismo huésped en una reserva y deduce el canal por el
 * color de fondo de la celda.
 */
@Injectable()
export class OccupancyImportService {
  private readonly logger = new Logger(OccupancyImportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
  ) {}

  async import(buffer: Buffer, dryRun = false): Promise<ImportSummary> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

    const summary: ImportSummary = {
      sheets: [],
      propertiesCreated: 0,
      reservationsCreated: 0,
      reservationsUpdated: 0,
      skipped: [],
    };

    const allReservations: Array<ReturnType<typeof this.group>[number]> = [];

    workbook.eachSheet((sheet) => {
      const month = this.monthFromSheetName(sheet.name);
      if (!month) {
        summary.skipped.push(sheet.name);
        return;
      }

      const nights = this.parseSheet(sheet, month);
      const reservations = this.group(nights);
      summary.sheets.push({ sheet: sheet.name, month, reservations: reservations.length });
      allReservations.push(...reservations);
    });

    if (summary.sheets.length === 0) {
      throw new BadRequestException(
        'No se reconoció ninguna hoja. Los nombres deben incluir el mes y el año, por ejemplo "Agosto_26".',
      );
    }

    if (dryRun) return summary;

    await this.persist(allReservations, summary);
    return summary;
  }

  // ------------------------------- lectura -------------------------------
  private parseSheet(sheet: ExcelJS.Worksheet, month: string): ParsedNight[] {
    const nights: ParsedNight[] = [];
    const lastRow = sheet.rowCount;

    let row = 1;
    while (row <= lastRow) {
      if (this.text(sheet.getRow(row).getCell(2).value) !== 'N° Dpto.') {
        row += 1;
        continue;
      }

      // La fila siguiente lleva los números de día.
      const dayRow = sheet.getRow(row + 1);
      const days = new Map<number, number>();
      for (const column of DAY_COLUMNS) {
        const value = this.number(dayRow.getCell(column).value);
        if (value && value >= 1 && value <= 31) days.set(column, value);
      }

      let current = row + 2;
      while (
        current <= lastRow &&
        this.text(sheet.getRow(current).getCell(2).value) !== 'N° Dpto.'
      ) {
        const dataRow = sheet.getRow(current);
        const dpto = this.number(dataRow.getCell(2).value);

        if (dpto) {
          for (const [column, day] of days) {
            const guestCell = dataRow.getCell(column);
            const guest = this.text(guestCell.value);
            if (!guest) continue;

            nights.push({
              dpto: String(dpto),
              date: `${month}-${String(day).padStart(2, '0')}`,
              guest: guest.replace(/\s+/g, ' ').trim(),
              price: this.number(dataRow.getCell(column + 1).value),
              channel: this.channelOf(guestCell),
              paymentCode: this.number(dataRow.getCell(column + 2).value),
            });
          }
        }
        current += 1;
      }

      row = current;
    }

    return nights;
  }

  /** Agrupa noches consecutivas del mismo huésped en una sola reserva. */
  private group(nights: ParsedNight[]) {
    const key = (n: ParsedNight) =>
      `${n.dpto}|${n.guest.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12)}`;

    const buckets = new Map<string, ParsedNight[]>();
    for (const night of nights) {
      const list = buckets.get(key(night)) ?? [];
      list.push(night);
      buckets.set(key(night), list);
    }

    const reservations: Array<{
      dpto: string;
      guest: string;
      checkIn: string;
      checkOut: string;
      nights: number;
      pricePerNight: number;
      channel: BookingChannel;
      paymentCode: number | null;
    }> = [];

    for (const list of buckets.values()) {
      list.sort((a, b) => a.date.localeCompare(b.date));

      let block: ParsedNight[] = [list[0]];
      const flush = () => {
        const first = block[0];
        const last = block[block.length - 1];
        const prices = block.map((b) => b.price).filter((p): p is number => Boolean(p));

        reservations.push({
          dpto: first.dpto,
          guest: first.guest,
          checkIn: first.date,
          checkOut: this.addDays(last.date, 1),
          nights: block.length,
          pricePerNight: prices.length
            ? Math.round((prices.reduce((sum, p) => sum + p, 0) / prices.length) * 100) / 100
            : 0,
          channel: first.channel,
          paymentCode: first.paymentCode,
        });
      };

      for (const night of list.slice(1)) {
        if (this.addDays(block[block.length - 1].date, 1) === night.date) {
          block.push(night);
        } else {
          flush();
          block = [night];
        }
      }
      flush();
    }

    return reservations;
  }

  // ------------------------------ escritura ------------------------------
  private async persist(
    reservations: ReturnType<typeof this.group>,
    summary: ImportSummary,
  ): Promise<void> {
    const owner = await this.prisma.user.findFirst({
      where: { role: { in: [Role.ADMIN, Role.SUPER_ADMIN] } },
      orderBy: { createdAt: 'asc' },
    });
    if (!owner) throw new BadRequestException('No hay ningún administrador en el sistema');

    const guestAccount = await this.ensureGuestAccount();
    const category = await this.prisma.category.findFirst({ where: { slug: 'departamento' } });
    const department = await this.prisma.department.findFirst({ where: { slug: 'lima' } });
    const province = department
      ? await this.prisma.province.findFirst({ where: { slug: 'lima', departmentId: department.id } })
      : null;

    if (!category || !department || !province) {
      throw new BadRequestException('Faltan catálogos base (categoría o ubicación de Lima)');
    }

    const district = await this.prisma.district.findFirst({
      where: { provinceId: province.id, slug: { in: ['cercado-de-lima', 'lima'] } },
    });

    const propertyByDpto = new Map<string, string>();

    for (const dpto of [...new Set(reservations.map((r) => r.dpto))]) {
      const slug = `departamento-${dpto}`;
      const existing = await this.prisma.property.findUnique({ where: { slug } });

      if (existing) {
        propertyByDpto.set(dpto, existing.id);
        continue;
      }

      const prices = reservations.filter((r) => r.dpto === dpto && r.pricePerNight > 0);
      const avgPrice = prices.length
        ? Math.round(prices.reduce((sum, r) => sum + r.pricePerNight, 0) / prices.length)
        : 150;

      const created = await this.prisma.$transaction(async (tx) => {
        const location = await tx.location.create({
          data: { departmentId: department.id, provinceId: province.id, districtId: district?.id },
        });

        return tx.property.create({
          data: {
            title: `Departamento ${dpto}`,
            slug,
            shortDescription: `Departamento ${dpto} · Cercado de Lima`,
            description:
              `Departamento ${dpto} en Cercado de Lima, equipado para estadías cortas y largas. ` +
              'Ficha creada al importar el control de ocupación; completa la descripción y las fotos.',
            pricePerNight: avgPrice,
            maxGuests: 4,
            bedrooms: 1,
            beds: 2,
            bathrooms: 1,
            status: PropertyStatus.DRAFT,
            ownerId: owner.id,
            categoryId: category.id,
            locationId: location.id,
          },
        });
      });

      propertyByDpto.set(dpto, created.id);
      summary.propertiesCreated += 1;
    }

    for (const item of reservations) {
      const propertyId = propertyByDpto.get(item.dpto);
      if (!propertyId) continue;

      // VarChar(20): I + dpto(4) + YYMMDD(6) + huésped(3) = 14 caracteres.
      const suffix = (item.guest.toLowerCase().replace(/[^a-z]/g, '').slice(0, 3) || 'x').toUpperCase();
      const code = `I${item.dpto}${item.checkIn.replace(/-/g, '').slice(2)}${suffix}`;

      const data = {
        propertyId,
        userId: guestAccount.id,
        checkIn: new Date(`${item.checkIn}T00:00:00Z`),
        checkOut: new Date(`${item.checkOut}T00:00:00Z`),
        guests: 2,
        nights: item.nights,
        pricePerNight: item.pricePerNight,
        cleaningFee: 0,
        totalPrice: item.pricePerNight * item.nights,
        status: this.statusFrom(item.paymentCode),
        channel: item.channel,
        guestName: item.guest.slice(0, 120),
        notes: 'Importado desde la hoja de ocupación',
      };

      const existing = await this.prisma.reservation.findUnique({ where: { code } });
      if (existing) {
        await this.prisma.reservation.update({ where: { code }, data });
        summary.reservationsUpdated += 1;
      } else {
        await this.prisma.reservation.create({ data: { code, ...data } });
        summary.reservationsCreated += 1;
      }
    }

    this.logger.log(
      `Importación: ${summary.reservationsCreated} nuevas, ${summary.reservationsUpdated} actualizadas`,
    );
  }

  /** Cuenta técnica, desactivada, a la que se cuelgan los huéspedes externos. */
  private async ensureGuestAccount() {
    const email = 'huespedes.importados@pyfgroupsac.com';
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) return existing;

    return this.prisma.user.create({
      data: {
        email,
        password: await this.passwords.hash(`import-${Date.now()}-${Math.random()}`),
        firstName: 'Huésped',
        lastName: 'Externo',
        role: Role.USER,
        isActive: false,
      },
    });
  }

  // ------------------------------- helpers -------------------------------
  /** "Agosto_26" → "2026-08". Devuelve null si el nombre no se reconoce. */
  private monthFromSheetName(name: string): string | null {
    const normalized = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const monthKey = Object.keys(MONTHS).find((key) => normalized.startsWith(key));
    if (!monthKey) return null;

    const yearMatch = normalized.match(/(\d{2,4})\s*$/);
    if (!yearMatch) return null;

    const raw = Number(yearMatch[1]);
    const year = raw < 100 ? 2000 + raw : raw;
    return `${year}-${String(MONTHS[monthKey]).padStart(2, '0')}`;
  }

  private channelOf(cell: ExcelJS.Cell): BookingChannel {
    const fill = cell.fill as ExcelJS.FillPattern | undefined;
    const color = fill?.fgColor;
    if (!color) return BookingChannel.OTHER;

    if (color.argb && RGB_CHANNEL[color.argb.toUpperCase()]) {
      return RGB_CHANNEL[color.argb.toUpperCase()];
    }
    if (typeof color.theme === 'number' && THEME_CHANNEL[color.theme]) {
      return THEME_CHANNEL[color.theme];
    }
    return BookingChannel.OTHER;
  }

  /** El "Es" de la hoja: 1 pagado, 2 sin pago, 3 pendiente Airbnb, 4 reservado. */
  private statusFrom(code: number | null): ReservationStatus {
    if (code === 1) return ReservationStatus.COMPLETED;
    if (code === 2 || code === 3) return ReservationStatus.PENDING;
    return ReservationStatus.CONFIRMED;
  }

  /** Las celdas de Excel pueden traer fórmulas o texto enriquecido. */
  private text(value: ExcelJS.CellValue): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);

    if (typeof value === 'object') {
      if ('richText' in value) return value.richText.map((part) => part.text).join('').trim();
      if ('result' in value) return String(value.result ?? '').trim();
      if ('text' in value) return String(value.text ?? '').trim();
    }
    return '';
  }

  private number(value: ExcelJS.CellValue): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && value !== null && 'result' in value) {
      const result = (value as ExcelJS.CellFormulaValue).result;
      return typeof result === 'number' ? result : null;
    }
    const parsed = Number(this.text(value));
    return Number.isFinite(parsed) && this.text(value) !== '' ? parsed : null;
  }

  private addDays(date: string, days: number): string {
    const next = new Date(`${date}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + days);
    return next.toISOString().slice(0, 10);
  }
}
