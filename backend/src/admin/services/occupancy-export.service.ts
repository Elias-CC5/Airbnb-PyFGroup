import { Injectable } from '@nestjs/common';
import { OccupancyCalendar, OccupancyService } from './occupancy.service';

/** Color de fondo por canal, igual que la leyenda de la hoja de cálculo. */
const CHANNEL_COLOR: Record<string, string> = {
  AIRBNB: '#92D050',
  BOOKING: '#0070C0',
  EXPEDIA: '#FFFF00',
  TIKTOK: '#E4C7E1',
  DIRECT: '#00E5FF',
  OTHER: '#D9D9D9',
};

const CHANNEL_LABEL: Record<string, string> = {
  AIRBNB: 'Airbnb',
  BOOKING: 'Booking',
  EXPEDIA: 'Expedia / VRBO',
  TIKTOK: 'TikTok y Pág.',
  DIRECT: 'Directo (P&F)',
  OTHER: 'Otros',
};

const WEEKDAYS = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];

/**
 * Exporta el calendario de ocupación a SpreadsheetML 2003 (.xls), un formato XML
 * que Excel y Google Sheets abren de forma nativa. Se eligió frente a .xlsx para
 * no añadir dependencias de compresión ZIP al backend.
 */
@Injectable()
export class OccupancyExportService {
  constructor(private readonly occupancy: OccupancyService) {}

  async build(month?: string): Promise<{ filename: string; xml: string }> {
    const calendar = await this.occupancy.calendar(month);
    return {
      filename: `ocupacion_${calendar.month}.xls`,
      xml: this.render(calendar),
    };
  }

  private render(calendar: OccupancyCalendar): string {
    // Los días se agrupan en semanas que empiezan en domingo, como en la hoja original.
    const weeks = this.groupByWeek(calendar.days);

    const rows: string[] = [];

    rows.push(this.titleRow(calendar.month, 8));

    for (const week of weeks) {
      rows.push(this.blankRow());
      rows.push(this.weekHeaderRow(week));
      rows.push(this.dayNumberRow(week));

      for (const property of calendar.rows) {
        rows.push(this.propertyRow(property.title, week, calendar));
      }

      rows.push(this.weekTotalRow(week, calendar));
    }

    rows.push(this.blankRow());
    rows.push(this.legendTitleRow());
    for (const [channel, label] of Object.entries(CHANNEL_LABEL)) {
      rows.push(
        `<Row><Cell ss:StyleID="s_label"><Data ss:Type="String">${this.escape(label)}</Data></Cell>` +
          `<Cell ss:StyleID="ch_${channel}"><Data ss:Type="String"></Data></Cell></Row>`,
      );
    }

    return this.document(rows.join('\n'));
  }

  // ------------------------------- filas -------------------------------
  private titleRow(month: string, span: number): string {
    return (
      `<Row ss:Height="26"><Cell ss:StyleID="s_title" ss:MergeAcross="${span}">` +
      `<Data ss:Type="String">Calendario de ocupación — ${this.escape(month)}</Data></Cell></Row>`
    );
  }

  private blankRow(): string {
    return '<Row/>';
  }

  private weekHeaderRow(week: string[]): string {
    const cells = week
      .map((day) => {
        const weekday = WEEKDAYS[new Date(`${day}T00:00:00Z`).getUTCDay()];
        return `<Cell ss:StyleID="s_head"><Data ss:Type="String">${weekday}</Data></Cell>`;
      })
      .join('');
    return `<Row><Cell ss:StyleID="s_head"><Data ss:Type="String">Alojamiento</Data></Cell>${cells}</Row>`;
  }

  private dayNumberRow(week: string[]): string {
    const cells = week
      .map((day) => {
        const number = Number(day.slice(8, 10));
        return `<Cell ss:StyleID="s_day"><Data ss:Type="Number">${number}</Data></Cell>`;
      })
      .join('');
    return `<Row><Cell ss:StyleID="s_day"><Data ss:Type="String"></Data></Cell>${cells}</Row>`;
  }

  private propertyRow(title: string, week: string[], calendar: OccupancyCalendar): string {
    const row = calendar.rows.find((r) => r.title === title);

    const cells = week
      .map((day) => {
        const night = row?.nights.find((n) => n.date === day);
        if (!night) return '<Cell ss:StyleID="s_cell"><Data ss:Type="String"></Data></Cell>';

        const text = `${night.guest} · S/ ${night.pricePerNight}`;
        return (
          `<Cell ss:StyleID="ch_${night.channel}">` +
          `<Data ss:Type="String">${this.escape(text)}</Data></Cell>`
        );
      })
      .join('');

    return (
      `<Row><Cell ss:StyleID="s_prop"><Data ss:Type="String">${this.escape(title)}</Data></Cell>` +
      `${cells}</Row>`
    );
  }

  private weekTotalRow(week: string[], calendar: OccupancyCalendar): string {
    const cells = week
      .map(
        (day) =>
          `<Cell ss:StyleID="s_total"><Data ss:Type="Number">${calendar.totals[day] ?? 0}</Data></Cell>`,
      )
      .join('');
    return `<Row><Cell ss:StyleID="s_total"><Data ss:Type="String">Total S/</Data></Cell>${cells}</Row>`;
  }

  private legendTitleRow(): string {
    return '<Row><Cell ss:StyleID="s_head"><Data ss:Type="String">Proveniencia del huésped</Data></Cell></Row>';
  }

  // ------------------------------ documento -----------------------------
  private document(rows: string): string {
    const channelStyles = Object.entries(CHANNEL_COLOR)
      .map(
        ([channel, color]) =>
          `<Style ss:ID="ch_${channel}">` +
          `<Interior ss:Color="${color}" ss:Pattern="Solid"/>` +
          '<Alignment ss:Vertical="Center"/>' +
          '<Font ss:Size="9"/>' +
          '<Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF"/>' +
          '<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF"/></Borders>' +
          '</Style>',
      )
      .join('');

    const columns =
      '<Column ss:Width="220"/>' + Array.from({ length: 7 }, () => '<Column ss:Width="120"/>').join('');

    return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal"><Font ss:FontName="Calibri" ss:Size="10"/></Style>
    <Style ss:ID="s_title"><Font ss:Size="14" ss:Bold="1"/></Style>
    <Style ss:ID="s_head">
      <Font ss:Size="10" ss:Bold="1"/>
      <Interior ss:Color="#BDD7EE" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="s_day">
      <Font ss:Size="10" ss:Bold="1"/>
      <Interior ss:Color="#F2F2F2" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="s_prop"><Font ss:Size="10" ss:Bold="1"/><Interior ss:Color="#FFF2CC" ss:Pattern="Solid"/></Style>
    <Style ss:ID="s_cell"><Font ss:Size="9"/></Style>
    <Style ss:ID="s_label"><Font ss:Size="10"/></Style>
    <Style ss:ID="s_total">
      <Font ss:Size="10" ss:Bold="1"/>
      <Interior ss:Color="#F4B183" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="#,##0.00"/>
    </Style>
    ${channelStyles}
  </Styles>
  <Worksheet ss:Name="Ocupación">
    <Table>
      ${columns}
      ${rows}
    </Table>
  </Worksheet>
</Workbook>`;
  }

  private escape(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Agrupa los días en semanas de domingo a sábado. */
  private groupByWeek(days: string[]): string[][] {
    const weeks: string[][] = [];
    let current: string[] = [];

    for (const day of days) {
      const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
      if (weekday === 0 && current.length > 0) {
        weeks.push(current);
        current = [];
      }
      current.push(day);
    }
    if (current.length > 0) weeks.push(current);

    return weeks;
  }
}
