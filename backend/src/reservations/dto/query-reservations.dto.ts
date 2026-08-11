import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryReservationsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ReservationStatus })
  @IsOptional() @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional() @IsUUID()
  propertyId?: string;

  @ApiPropertyOptional({ description: 'Código de reserva o nombre del huésped' })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional() @IsOptional() @IsDateString()
  from?: string;

  @ApiPropertyOptional() @IsOptional() @IsDateString()
  to?: string;
}
