import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { DashboardService } from '../services/dashboard.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly dashboardService: DashboardService) {}

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
}
