import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto, UpdateComplaintDto } from './dto';

@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Public()
  @Post()
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  @ApiOperation({ summary: 'Registrar un reclamo o queja (Libro de Reclamaciones)' })
  create(@Body() dto: CreateComplaintDto) {
    return this.complaintsService.create(dto);
  }

  @Public()
  @Get('code/:code')
  @ApiOperation({ summary: 'Consultar el estado de un reclamo por su código' })
  findByCode(@Param('code') code: string) {
    return this.complaintsService.findByCode(code);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Listar reclamos (admin)' })
  findAll(@Query('status') status?: string) {
    return this.complaintsService.findAll(status);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar estado/respuesta de un reclamo (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateComplaintDto) {
    return this.complaintsService.update(id, dto);
  }
}