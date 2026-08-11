import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateAmenityDto, UpdateAmenityDto } from '../dto';
import { AmenitiesService } from '../services/amenities.service';

@ApiTags('Amenities')
@Controller('amenities')
@UseGuards(RolesGuard)
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Public()
  @Get()
  findAll() {
    return this.amenitiesService.findAll();
  }

  @Public()
  @Get('grouped')
  findGrouped() {
    return this.amenitiesService.findGrouped();
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  create(@Body() dto: CreateAmenityDto) {
    return this.amenitiesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAmenityDto) {
    return this.amenitiesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.amenitiesService.remove(id);
  }
}
