import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HostApplicationStatus, HostStatus, Role } from '@prisma/client';
import { Roles } from '../../common/decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ReviewHostApplicationDto, SuspendHostDto } from '../dto/host.dto';
import { HostAdminService } from '../services/host-admin.service';

@ApiTags('Admin · Anfitriones')
@ApiBearerAuth()
@Controller('admin/hosts')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class HostsAdminController {
  constructor(private readonly admin: HostAdminService) {}

  // ------------------------------ solicitudes ------------------------------

  @Get('applications')
  @ApiOperation({ summary: 'Solicitudes para ser anfitrión' })
  applications(
    @Query('status') status?: HostApplicationStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.admin.applications(status, Number(page) || 1, Number(limit) || 20);
  }

  @Get('applications/:id')
  @ApiOperation({ summary: 'Detalle de una solicitud (sin documentos)' })
  application(@Param('id', ParseUUIDPipe) id: string) {
    return this.admin.application(id);
  }

  @Get('applications/:id/documents')
  @ApiOperation({
    summary: 'Documentos de identidad del solicitante',
    description:
      'Datos personales sensibles. Cada consulta queda registrada con quién la hizo y desde qué IP.',
  })
  documents(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') viewerId: string,
    @Ip() ip: string,
  ) {
    return this.admin.documents(id, viewerId, ip);
  }

  @Get('applications/:id/access-log')
  @ApiOperation({ summary: 'Quién consultó los documentos de esta solicitud' })
  accessLog(@Param('id', ParseUUIDPipe) id: string) {
    return this.admin.accessLog(id);
  }

  @Patch('applications/:id/review')
  @ApiOperation({ summary: 'Aprueba o rechaza la solicitud' })
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: ReviewHostApplicationDto,
  ) {
    return this.admin.review(id, reviewerId, dto);
  }

  // ------------------------------ anfitriones ------------------------------

  @Get()
  @ApiOperation({ summary: 'Lista de anfitriones' })
  hosts(
    @Query('status') status?: HostStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.admin.hosts(status, Number(page) || 1, Number(limit) || 20);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspende al anfitrión y despublica sus alojamientos' })
  suspend(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SuspendHostDto) {
    return this.admin.suspend(id, dto);
  }

  @Patch(':id/reactivate')
  @ApiOperation({ summary: 'Reactiva al anfitrión (sus fichas siguen pausadas)' })
  reactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.admin.reactivate(id);
  }
}
