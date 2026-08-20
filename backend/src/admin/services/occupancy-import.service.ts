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
  /**
   * Lee una hoja de mes. La hoja la mantiene el equipo a mano, así que el
   * formato varía entre meses y hay que deducirlo bloque por bloque en vez de
   * asumir posiciones fijas:
   *
   *  · Las columnas de día se detectan buscando el número de día seguido de
   *    "Precio". En 2026 unos meses arrancan en la columna C y otros en la D.
   *  · Las hojas de 2025 no llevan precio: los días van en la propia fila de
   *    cabecera, una columna por día.
   *  · Una noche cuenta si hay huésped O hay precio. A veces se escribe el
   *    importe y se olvida el nombre; esas noches son reales y se cuelgan del
   *    huésped anterior de la misma fila.
   *  · Alguna fila de totales semanales quedó con un número de departamento en
   *    la columna B (en marzo 2026, un 2105). Se reconoce porque ese dpto ya
   *    salió en el bloque y la fila no tiene ni un nombre.
   */
  private parseSheet(sheet: ExcelJS.Worksheet, month: string): ParsedNight[] {
    const nights: ParsedNight[] = [];
    const lastRow = sheet.rowCount;

    // Para las hojas sin "Precio", los bloques son semanas consecutivas: sirve
    // para descartar el arrastre del último día del mes anterior.
    let diaEsperado = 1;

    let row = 1;
    while (row <= lastRow) {
      const dptoCol = this.headerColumn(sheet, row);
      if (!dptoCol) {
        row += 1;
        continue;
      }

      const layout = this.detectLayout(sheet, row, dptoCol, diaEsperado);
      if (!layout) {
        row += 1;
        continue;
      }
      if (!layout.hasPrices) {
        diaEsperado = Math.max(...layout.days.values()) + 1;
      }

      // Primera pasada: ubicar las filas de totales disfrazadas de dpto.
      const vistos = new Set<number>();
      const omitir = new Set<number>();
      let scan = layout.firstDataRow;
      while (scan <= lastRow && !this.headerColumn(sheet, scan)) {
        const dpto = this.number(sheet.getRow(scan).getCell(dptoCol).value);
        if (dpto && dpto >= 100 && dpto <= 9999) {
          const tieneNombre = [...layout.days.keys()].some((c) =>
            this.text(sheet.getRow(scan).getCell(c).value),
          );
          if (vistos.has(dpto) && !tieneNombre) omitir.add(scan);
          vistos.add(dpto);
        }
        scan += 1;
      }

      const columnas = [...layout.days.keys()].sort((a, b) => a - b);
      let current = layout.firstDataRow;

      while (current <= lastRow && !this.headerColumn(sheet, current)) {
        const dataRow = sheet.getRow(current);
        const dpto = this.number(dataRow.getCell(dptoCol).value);

        // Los departamentos son de tres o cuatro dígitos (201, 1104…). Un número
        // suelto de una o dos cifras es un día o un contador, no una habitación.
        if (dpto && dpto >= 100 && dpto <= 9999 && !omitir.has(current)) {
          // Nombres de la fila, ya limpios: un valor puramente numérico no es
          // un huésped, es un resto de fórmula.
          const nombres = new Map<number, string>();
          for (const c of columnas) {
            const valor = this.text(dataRow.getCell(c).value).replace(/\s+/g, ' ').trim();
            nombres.set(c, valor && !/^[\d.,\s]+$/.test(valor) ? valor : '');
          }

          let ultimoNombre = '';
          let ultimaCelda: ExcelJS.Cell | null = null;

          for (const column of columnas) {
            const day = layout.days.get(column)!;
            const celda = dataRow.getCell(column);
            const price = layout.hasPrices ? this.number(dataRow.getCell(column + 1).value) : null;
            let guest = nombres.get(column) ?? '';

            if (!guest && price === null) {
              ultimoNombre = '';
              ultimaCelda = null;
              continue;
            }

            let origen = celda;
            if (!guest) {
              // Precio suelto: continúa la estadía anterior de la fila. Si no
              // hay ninguna a la izquierda, se toma el siguiente nombre.
              guest =
                ultimoNombre ||
                columnas.filter((c) => c > column).map((c) => nombres.get(c) ?? '').find(Boolean) ||
                `Sin nombre ${dpto}`;
              if (ultimaCelda) origen = ultimaCelda;
            }

            ultimoNombre = guest;
            ultimaCelda = origen;

            nights.push({
              dpto: String(dpto),
              date: `${month}-${String(day).padStart(2, '0')}`,
              guest,
              price,
              channel: this.channelOf(origen),
              paymentCode: layout.hasPrices
                ? this.number(dataRow.getCell(column + 2).value)
                : null,
            });
          }
        }
        current += 1;
      }

      row = current;
    }

    return nights;
  }

  /**
   * Deduce dónde están los días de un bloque. Devuelve null si la fila
   * "N° Dpto." no viene seguida de una fila de días reconocible.
   */
  private detectLayout(
    sheet: ExcelJS.Worksheet,
    headerRow: number,
    dptoCol: number,
    diaEsperado: number,
  ): { days: Map<number, number>; firstDataRow: number; hasPrices: boolean } | null {
    const ancho = Math.max(sheet.columnCount, dptoCol + 28);

    // Formato con precios: día, "Precio", "Es" en tríos. La fila de días es la
    // siguiente a la cabecera.
    const conPrecio = new Map<number, number>();
    const filaDias = sheet.getRow(headerRow + 1);
    for (let c = dptoCol + 1; c <= ancho; c += 1) {
      const dia = this.number(filaDias.getCell(c).value);
      const etiqueta = this.text(filaDias.getCell(c + 1).value).toLowerCase();
      if (dia && dia >= 1 && dia <= 31 && etiqueta.startsWith('precio')) conPrecio.set(c, dia);
    }
    if (conPrecio.size) {
      return { days: conPrecio, firstDataRow: headerRow + 2, hasPrices: true };
    }

    // Formato sin precios (hojas de 2025): una columna por día, en la propia
    // cabecera o en la fila de abajo.
    for (const fila of [headerRow, headerRow + 1]) {
      const sueltos = new Map<number, number>();
      for (let c = dptoCol + 1; c <= dptoCol + 9; c += 1) {
        const dia = this.dayFrom(sheet.getRow(fila).getCell(c).value);
        if (dia) sueltos.set(c, dia);
      }
      const limpios = this.soloDiasDelBloque(sueltos, diaEsperado);
      if (limpios.size) {
        return { days: limpios, firstDataRow: fila + 1, hasPrices: false };
      }
    }

    return null;
  }

  /**
   * Columna donde vive el número de departamento en esta fila, si es una fila
   * de cabecera. No siempre es la B: abril 2026 tiene la hoja corrida a la D.
   */
  private headerColumn(sheet: ExcelJS.Worksheet, row: number): number | null {
    for (let c = 1; c <= 6; c += 1) {
      const valor = this.text(sheet.getRow(row).getCell(c).value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      if (valor.startsWith('n° dpto') || valor.startsWith('n dpto')) return c;
    }
    return null;
  }

  /** 15 → 15 · "15 shak" → 15 · cualquier otra cosa → null. */
  private dayFrom(value: ExcelJS.CellValue): number | null {
    const numero = this.number(value);
    if (numero && numero >= 1 && numero <= 31) return Math.trunc(numero);

    const match = this.text(value).match(/^(\d{1,2})\b/);
    if (!match) return null;
    const dia = Number(match[1]);
    return dia >= 1 && dia <= 31 ? dia : null;
  }

  /** Un bloque es una semana: sólo caben días entre el esperado y +6. */
  private soloDiasDelBloque(dias: Map<number, number>, esperado: number): Map<number, number> {
    const salida = new Map<number, number>();
    let previo: number | null = null;

    for (const columna of [...dias.keys()].sort((a, b) => a - b)) {
      const dia = dias.get(columna)!;
      if (dia < esperado || dia > esperado + 6) continue;
      if (previo !== null && dia <= previo) continue;
      salida.set(columna, dia);
      previo = dia;
    }

    return salida;
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
      totalPrice: number;
      channel: BookingChannel;
      paymentCode: number | null;
    }> = [];

    for (const list of buckets.values()) {
      list.sort((a, b) => a.date.localeCompare(b.date));

      let block: ParsedNight[] = [list[0]];
      const flush = () => {
        const first = block[0];
        const last = block[block.length - 1];
        // El total es la suma real de las noches, no el promedio por la
        // cantidad de noches. Cuando la hoja deja alguna noche sin precio,
        // promediar sólo las que sí lo tienen y multiplicar por el total de
        // noches inflaba la facturación (en febrero 2026 sobraban S/ 769.98).
        const totalPrice =
          Math.round(block.reduce((sum, b) => sum + (b.price ?? 0), 0) * 100) / 100;

        reservations.push({
          dpto: first.dpto,
          guest: first.guest,
          checkIn: first.date,
          checkOut: this.addDays(last.date, 1),
          nights: block.length,
          pricePerNight: Math.round((totalPrice / block.length) * 100) / 100,
          totalPrice,
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

    // Dos huéspedes con las mismas tres iniciales, el mismo depa y el mismo día
    // generarían el mismo código y uno pisaría al otro sin avisar. Se lleva la
    // cuenta y se desempata con un sufijo.
    const usados = new Map<string, number>();

    for (const item of reservations) {
      const propertyId = propertyByDpto.get(item.dpto);
      if (!propertyId) continue;

      // VarChar(20): I + dpto(4) + YYMMDD(6) + huésped(3) = 14 caracteres.
      const suffix = (item.guest.toLowerCase().replace(/[^a-z]/g, '').slice(0, 3) || 'x').toUpperCase();
      const base = `I${item.dpto}${item.checkIn.replace(/-/g, '').slice(2)}${suffix}`;
      const repeticion = (usados.get(base) ?? 0) + 1;
      usados.set(base, repeticion);
      const code = repeticion === 1 ? base : `${base}${repeticion}`;

      const data = {
        propertyId,
        userId: guestAccount.id,
        checkIn: new Date(`${item.checkIn}T00:00:00Z`),
        checkOut: new Date(`${item.checkOut}T00:00:00Z`),
        guests: 2,
        nights: item.nights,
        pricePerNight: item.pricePerNight,
        cleaningFee: 0,
        totalPrice: item.totalPrice,
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
