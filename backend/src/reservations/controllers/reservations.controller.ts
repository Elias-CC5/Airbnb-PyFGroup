import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateReservationDto, QueryReservationsDto, UpdateReservationStatusDto } from '../dto';
import { ReservationsService } from '../services/reservations.service';

@ApiTags('Reservations')
@ApiBearerAuth()
@Controller('reservations')
@UseGuards(RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una reserva (verifica disponibilidad)' })
  create(@Body() dto: CreateReservationDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reservationsService.create(dto, user);
  }

  @Get('me')
  @ApiOperation({ summary: 'Mis reservas' })
  findMine(@CurrentUser('id') userId: string, @Query() query: QueryReservationsDto) {
    return this.reservationsService.findMine(userId, query);
  }

  @Get('host')
  @Roles(Role.HOST)
  @ApiOperation({
    summary: 'Reservas de mis alojamientos (anfitrión)',
    description: 'Sólo devuelve reservas de propiedades cuyo ownerId es el usuario autenticado.',
  })
  findForHost(@CurrentUser('id') userId: string, @Query() query: QueryReservationsDto) {
    return this.reservationsService.findForHost(userId, query);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar todas las reservas (admin)' })
  findAll(@Query() query: QueryReservationsDto) {
    return this.reservationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.reservationsService.findOne(id, user);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cambiar el estado de una reserva (admin)' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateReservationStatusDto) {
    return this.reservationsService.updateStatus(id, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar mi reserva' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body('reason') reason?: string,
  ) {
    return this.reservationsService.cancelMine(id, user, reason);
  }
}
