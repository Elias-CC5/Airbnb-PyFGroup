import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  ChooseFreeSlotDto,
  RegisterCashDto,
  ReportPaymentDto,
  ReviewPaymentDto,
  SubscribeDto,
} from '../dto/subscription.dto';
import { SubscriptionsService } from '../services/subscriptions.service';

@ApiTags('Anfitriones · Planes')
@Controller('hosts/plans')
export class HostPlansController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Planes disponibles y sus precios' })
  plans() {
    return this.subscriptions.plans();
  }
}

@ApiTags('Anfitriones · Planes')
@ApiBearerAuth()
@Controller('hosts/subscription')
export class HostSubscriptionController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Mi plan: cupos, vigencia y pago en curso' })
  myPlan(@CurrentUser('id') userId: string) {
    return this.subscriptions.myPlan(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Elegir un plan; queda a la espera del pago' })
  subscribe(@CurrentUser('id') userId: string, @Body() dto: SubscribeDto) {
    return this.subscriptions.subscribe(userId, dto);
  }

  @Patch(':id/payment')
  @ApiOperation({
    summary: 'Reportar el pago',
    description: 'No activa el plan: lo deja en revisión hasta que un administrador lo confirme.',
  })
  reportPayment(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReportPaymentDto,
  ) {
    return this.subscriptions.reportPayment(userId, id, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar un plan que aún no está activo' })
  cancel(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptions.cancelPending(userId, id);
  }

  @Patch('free-slot')
  @ApiOperation({ summary: 'Elegir qué alojamiento conservo si vence mi plan' })
  chooseFreeSlot(@CurrentUser('id') userId: string, @Body() dto: ChooseFreeSlotDto) {
    return this.subscriptions.chooseFreeSlot(userId, dto.propertyId);
  }
}

@ApiTags('Admin · Anfitriones')
@ApiBearerAuth()
@Controller('admin/hosts/payments')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AdminSubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Pagos por verificar' })
  pending(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.subscriptions.pendingPayments(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Confirmar o rechazar un pago' })
  review(
    @CurrentUser('id') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewPaymentDto,
  ) {
    return this.subscriptions.reviewPayment(adminId, id, dto);
  }

  @Post('cash')
  @ApiOperation({
    summary: 'Registrar un pago en efectivo',
    description: 'Sólo lo crea quien recibió el dinero; queda activo al instante.',
  })
  cash(@CurrentUser('id') adminId: string, @Body() dto: RegisterCashDto) {
    return this.subscriptions.registerCashPayment(
      adminId,
      dto.hostProfileId,
      dto.planId,
      dto.notes,
    );
  }

  @Post('expire-due')
  @ApiOperation({ summary: 'Cerrar las suscripciones vencidas (repaso manual)' })
  expireDue() {
    return this.subscriptions.expireAllDue();
  }
}
