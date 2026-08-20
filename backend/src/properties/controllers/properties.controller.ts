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
import { HostActiveGuard } from '../../hosts/guards/host-active.guard';
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

  // Va antes de :id para que la ruta literal no la capture el parámetro.
  @Get('mine')
  @Roles(Role.HOST)
  @UseGuards(HostActiveGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mis alojamientos (anfitrión)' })
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.propertiesService.findMine(user);
  }

  @Get(':id')
  @Roles(Role.HOST)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Detalle por ID',
    description: 'El anfitrión sólo puede consultar los suyos; se comprueba contra ownerId.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.propertiesService.ensureCanManage(id, user);
    return this.propertiesService.findOne(id);
  }

  @Post()
  @Roles(Role.HOST)
  @UseGuards(HostActiveGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear alojamiento',
    description: 'Un anfitrión lo crea siempre en DRAFT; publicar requiere aprobación.',
  })
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: AuthenticatedUser) {
    return this.propertiesService.create(dto, user);
  }

  @Patch(':id')
  @Roles(Role.HOST)
  @UseGuards(HostActiveGuard)
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.propertiesService.update(id, dto, user);
  }

  @Patch(':id/status/:status')
  @Roles(Role.HOST)
  @UseGuards(HostActiveGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambia el estado del alojamiento',
    description:
      'El anfitrión puede enviar a revisión, pausar, reactivar o archivar los suyos. ' +
      'Sólo un administrador puede pasar una ficha a ACTIVE.',
  })
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('status') status: PropertyStatus,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.propertiesService.changeStatus(id, status, user);
  }

  /** Destacar en el home es decisión editorial: sólo administración. */
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
  @Roles(Role.HOST)
  @UseGuards(HostActiveGuard)
  @ApiBearerAuth()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.propertiesService.remove(id, user);
  }
}
