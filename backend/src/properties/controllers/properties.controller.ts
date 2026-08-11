import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PropertyStatus, Role } from '@prisma/client';
import { OptionalJwtGuard } from '../../auth/guards/optional-jwt.guard';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreatePropertyDto, SearchPropertyDto, UpdatePropertyDto } from '../dto';
import { PropertiesService } from '../services/properties.service';

@ApiTags('Properties')
@Controller('properties')
@UseGuards(RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Get()
  @ApiOperation({ summary: 'Buscar alojamientos con filtros y disponibilidad' })
  search(@Query() query: SearchPropertyDto, @CurrentUser() user?: AuthenticatedUser) {
    return this.propertiesService.search(query, user);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Alojamientos destacados para el home' })
  featured(@Query('limit') limit?: string) {
    return this.propertiesService.findFeatured(limit ? Number(limit) : 8);
  }

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Detalle público por slug (URL amigable)' })
  findBySlug(@Param('slug') slug: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.propertiesService.findBySlug(slug, user);
  }

  @Public()
  @Get('slug/:slug/similar')
  similar(@Param('slug') slug: string, @Query('limit') limit?: string) {
    return this.propertiesService.findSimilar(slug, limit ? Number(limit) : 4);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalle por ID (administración)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear alojamiento' })
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: AuthenticatedUser) {
    return this.propertiesService.create(dto, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.propertiesService.update(id, dto, user);
  }

  @Patch(':id/status/:status')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar / desactivar / publicar' })
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('status') status: PropertyStatus,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.propertiesService.changeStatus(id, status, user);
  }

  @Patch(':id/featured/:value')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  toggleFeatured(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('value') value: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.propertiesService.toggleFeatured(id, value === 'true', user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.propertiesService.remove(id, user);
  }
}
