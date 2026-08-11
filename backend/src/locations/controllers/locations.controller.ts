import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { LocationsService } from '../services/locations.service';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Public()
  @Get('departments')
  @ApiOperation({ summary: 'Departamentos del Perú con conteo de alojamientos' })
  departments() {
    return this.locationsService.departments();
  }

  @Public()
  @Get('departments/top')
  top(@Query('limit') limit?: string) {
    return this.locationsService.topDestinations(limit ? Number(limit) : 6);
  }

  @Public()
  @Get('departments/:id/provinces')
  provinces(@Param('id', ParseIntPipe) id: number) {
    return this.locationsService.provinces(id);
  }

  @Public()
  @Get('provinces/:id/districts')
  districts(@Param('id', ParseIntPipe) id: number) {
    return this.locationsService.districts(id);
  }
}
