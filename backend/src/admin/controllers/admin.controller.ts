import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Response } from 'express';
import { Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { DashboardService } from '../services/dashboard.service';
import { OccupancyExportService } from '../services/occupancy-export.service';
import { OccupancyImportService } from '../services/occupancy-import.service';
import { OccupancyService } from '../services/occupancy.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly occupancyService: OccupancyService,
    private readonly occupancyExport: OccupancyExportService,
    private readonly occupancyImport: OccupancyImportService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Métricas generales del panel' })
  stats() {
    return this.dashboardService.stats();
  }

  @Get('dashboard/reservations-series')
  reservationsSeries(@Query('months') months?: string) {
    return this.dashboardService.monthlySeries(months ? Number(months) : 12);
  }

  @Get('dashboard/users-series')
  usersSeries(@Query('months') months?: string) {
    return this.dashboardService.usersSeries(months ? Number(months) : 12);
  }

  @Get('dashboard/top-properties')
  topProperties(@Query('limit') limit?: string) {
    return this.dashboardService.topProperties(limit ? Number(limit) : 5);
  }

  @Get('dashboard/recent-reservations')
  recent(@Query('limit') limit?: string) {
    return this.dashboardService.recentReservations(limit ? Number(limit) : 8);
  }

  // ------------------------- calendario de ocupación -------------------------
  @Get('calendar')
  @ApiOperation({ summary: 'Ocupación del mes: una fila por alojamiento, una columna por día' })
  calendar(@Query('month') month?: string) {
    return this.occupancyService.calendar(month);
  }

  @Get('calendar/export')
  @ApiOperation({ summary: 'Descarga el calendario de ocupación como hoja de cálculo' })
  async exportCalendar(@Res({ passthrough: true }) res: Response, @Query('month') month?: string) {
    const { filename, xml } = await this.occupancyExport.build(month);

    res.set({
      'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(Buffer.from(xml, 'utf-8'));
  }

  @Post('calendar/import')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importa la hoja de ocupación (.xlsx) y crea las reservas' })
  @UseInterceptors(FileInterceptor('file'))
  importCalendar(
    @UploadedFile() file: Express.Multer.File,
    @Query('dryRun') dryRun?: string,
  ) {
    if (!file) throw new BadRequestException('Adjunta el archivo .xlsx');
    return this.occupancyImport.import(file.buffer, dryRun === 'true');
  }
}
