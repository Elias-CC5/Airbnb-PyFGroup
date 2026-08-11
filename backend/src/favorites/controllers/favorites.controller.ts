import { Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FavoritesService } from '../services/favorites.service';

@ApiTags('Favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Mis alojamientos favoritos' })
  findMine(@CurrentUser('id') userId: string, @Query() pagination: PaginationDto) {
    return this.favoritesService.findMine(userId, pagination);
  }

  @Get('ids')
  ids(@CurrentUser('id') userId: string) {
    return this.favoritesService.ids(userId);
  }

  @Get('count')
  count(@CurrentUser('id') userId: string) {
    return this.favoritesService.count(userId);
  }

  @Post(':propertyId/toggle')
  @ApiOperation({ summary: 'Guardar o quitar de favoritos' })
  toggle(@CurrentUser('id') userId: string, @Param('propertyId', ParseUUIDPipe) propertyId: string) {
    return this.favoritesService.toggle(userId, propertyId);
  }

  @Delete(':propertyId')
  remove(@CurrentUser('id') userId: string, @Param('propertyId', ParseUUIDPipe) propertyId: string) {
    return this.favoritesService.toggle(userId, propertyId);
  }
}
