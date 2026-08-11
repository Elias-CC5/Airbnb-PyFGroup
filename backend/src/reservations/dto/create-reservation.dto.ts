import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  propertyId: string;

  @ApiProperty({ example: '2026-09-10' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ example: '2026-09-14' })
  @IsDateString()
  checkOut: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number) @IsInt() @Min(1)
  guests: number;

  @ApiPropertyOptional({ example: 'Llegaremos alrededor de las 8 pm' })
  @IsOptional() @IsString() @MaxLength(500)
  notes?: string;
}
