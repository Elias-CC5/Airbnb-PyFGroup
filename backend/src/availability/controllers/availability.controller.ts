import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CheckAvailabilityDto, CreateBlockDto } from '../dto';
import { AvailabilityService } from '../services/availability.service';

@ApiTags('Availability')
@Controller('availability')
@UseGuards(RolesGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Public()
  @Get('properties/:id/occupied')
  @ApiOperation({ summary: 'Rangos ocupados para pintar el calendario' })
  occupied(@Param('id', ParseUUIDPipe) id: string, @Query('months') months?: string) {
    return this.availabilityService.occupiedDates(id, months ? Number(months) : 12);
  }

  @Public()
  @Post('properties/:id/check')
  @ApiOperation({ summary: 'Verificar disponibilidad y calcular el precio total' })
  check(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CheckAvailabilityDto) {
    return this.availabilityService.check(id, dto);
  }

  @Get('properties/:id/blocks')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  blocks(@Param('id', ParseUUIDPipe) id: string) {
    return this.availabilityService.listBlocks(id);
  }

  @Post('properties/:id/blocks')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  createBlock(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateBlockDto) {
    return this.availabilityService.createBlock(id, dto);
  }

  @Delete('blocks/:blockId')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  removeBlock(@Param('blockId', ParseUUIDPipe) blockId: string) {
    return this.availabilityService.removeBlock(blockId);
  }
}
