import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Casa de campo' })
  @IsString() @MinLength(3) @MaxLength(80)
  name: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ example: 'home' })
  @IsOptional() @IsString() @MaxLength(60)
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @Type(() => Number) @IsInt()
  order?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
