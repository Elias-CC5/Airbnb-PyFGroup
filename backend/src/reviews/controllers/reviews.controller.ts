import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateReviewDto, UpdateReviewDto } from '../dto';
import { ReviewsService } from '../services/reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Reseñas de un alojamiento' })
  findByProperty(@Param('propertyId', ParseUUIDPipe) propertyId: string, @Query() pagination: PaginationDto) {
    return this.reviewsService.findByProperty(propertyId, pagination);
  }

  @Public()
  @Get('property/:propertyId/summary')
  summary(@Param('propertyId', ParseUUIDPipe) propertyId: string) {
    return this.reviewsService.summary(propertyId);
  }

  @Get('me')
  @ApiBearerAuth()
  findMine(@CurrentUser('id') userId: string) {
    return this.reviewsService.findMine(userId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dejar una reseña (requiere estadía completada)' })
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.create(dto, user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateReviewDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.remove(id, user);
  }

  @Patch(':id/visibility/:value')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Moderar: mostrar u ocultar una reseña' })
  setVisibility(@Param('id', ParseUUIDPipe) id: string, @Param('value') value: string) {
    return this.reviewsService.setVisibility(id, value === 'true');
  }
}
