import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingChannel, ReservationStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/** Alta manual de una estadía desde el calendario del panel. */
export class CreateOccupancyEntryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  propertyId: string;

  @ApiProperty({ example: 'Yadira Regalado' })
  @IsString() @MinLength(2) @MaxLength(120)
  guestName: string;

  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ example: '2026-08-04' })
  @IsDateString()
  checkOut: string;

  @ApiProperty({ example: 150 })
  @Type(() => Number) @IsNumber() @Min(0)
  pricePerNight: number;

  @ApiPropertyOptional({ enum: BookingChannel, default: BookingChannel.DIRECT })
  @IsOptional() @IsEnum(BookingChannel)
  channel?: BookingChannel;

  @ApiPropertyOptional({ enum: ReservationStatus, default: ReservationStatus.CONFIRMED })
  @IsOptional() @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({ example: 2, default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  guests?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  notes?: string;
}

/** Todos los campos opcionales: el panel envía solo lo que cambió. */
export class UpdateOccupancyEntryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional() @IsUUID()
  propertyId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120)
  guestName?: string;

  @ApiPropertyOptional({ example: '2026-08-01' })
  @IsOptional() @IsDateString()
  checkIn?: string;

  @ApiPropertyOptional({ example: '2026-08-04' })
  @IsOptional() @IsDateString()
  checkOut?: string;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  pricePerNight?: number;

  @ApiPropertyOptional({ enum: BookingChannel })
  @IsOptional() @IsEnum(BookingChannel)
  channel?: BookingChannel;

  @ApiPropertyOptional({ enum: ReservationStatus })
  @IsOptional() @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  guests?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  notes?: string;
}
