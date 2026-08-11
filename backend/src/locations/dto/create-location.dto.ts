import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsLatitude, IsLongitude, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ example: 1, description: 'ID del departamento' })
  @Type(() => Number) @IsInt()
  departmentId: number;

  @ApiProperty({ example: 1, description: 'ID de la provincia' })
  @Type(() => Number) @IsInt()
  provinceId: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del distrito' })
  @IsOptional() @Type(() => Number) @IsInt()
  districtId?: number;

  @ApiPropertyOptional({ example: 'Calle Los Álamos 123' })
  @IsOptional() @IsString() @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ example: 'A dos cuadras de la plaza' })
  @IsOptional() @IsString() @MaxLength(200)
  reference?: string;

  @ApiPropertyOptional({ example: -13.5319 })
  @IsOptional() @Type(() => Number) @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ example: -71.9675 })
  @IsOptional() @Type(() => Number) @IsLongitude()
  longitude?: number;
}
