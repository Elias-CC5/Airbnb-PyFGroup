import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAmenityDto {
  @ApiProperty({ example: 'WiFi' })
  @IsString() @MinLength(2) @MaxLength(80)
  name: string;

  @ApiPropertyOptional({ example: 'wifi' })
  @IsOptional() @IsString() @MaxLength(60)
  icon?: string;

  @ApiPropertyOptional({ example: 'Esenciales' })
  @IsOptional() @IsString() @MaxLength(60)
  group?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
