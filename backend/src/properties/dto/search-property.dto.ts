import { ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum PropertySort {
  RECENT = 'recent',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  RATING = 'rating',
  POPULAR = 'popular',
}

/** Convierte "1,2,3" o ["1","2"] en number[]. */
const toIntArray = () =>
  Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const raw = Array.isArray(value) ? value : String(value).split(',');
    return raw.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
  });

export class SearchPropertyDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Texto libre: título, descripción o destino' })
  @IsOptional() @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Slug del departamento, ej. "cusco"' })
  @IsOptional() @IsString()
  department?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt()
  departmentId?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt()
  provinceId?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt()
  districtId?: number;

  @ApiPropertyOptional({ description: 'Slug de la categoría' })
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  minPrice?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  guests?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional({ description: 'IDs de amenidades separados por coma', example: '1,4' })
  @IsOptional() @IsArray() @toIntArray()
  amenities?: number[];

  @ApiPropertyOptional({ example: '2026-09-10' })
  @IsOptional() @IsDateString()
  checkIn?: string;

  @ApiPropertyOptional({ example: '2026-09-14' })
  @IsOptional() @IsDateString()
  checkOut?: string;

  @ApiPropertyOptional({ enum: PropertySort, default: PropertySort.RECENT })
  @IsOptional() @IsEnum(PropertySort)
  sort?: PropertySort = PropertySort.RECENT;

  @ApiPropertyOptional({ enum: PropertyStatus, description: 'Sólo administradores' })
  @IsOptional() @IsEnum(PropertyStatus)
  status?: PropertyStatus;
}
