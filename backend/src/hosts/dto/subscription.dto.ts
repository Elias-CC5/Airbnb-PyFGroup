import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class SubscribeDto {
  @ApiProperty({ description: 'Plan elegido' })
  @IsUUID()
  planId!: string;
}

export class ReportPaymentDto {
  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.YAPE })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiProperty({ example: '01234567', description: 'Número de operación de Yape, Plin o del banco' })
  @Transform(trim)
  @IsString()
  @Length(4, 60)
  operationNumber!: string;

  @ApiPropertyOptional({ description: 'Captura del pago' })
  @IsOptional()
  @IsUrl()
  proofUrl?: string;

  @ApiPropertyOptional({ example: '2026-08-21', description: 'Cuándo se hizo el pago' })
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}

export class ReviewPaymentDto {
  @ApiProperty({ description: 'true confirma el pago; false lo rechaza' })
  @IsBoolean()
  approve!: boolean;

  @ApiPropertyOptional({ description: 'Obligatorio al rechazar. Se le envía al anfitrión.' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;

  @ApiPropertyOptional({ description: 'Notas internas. El anfitrión no las ve.' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  adminNotes?: string;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}

export class RegisterCashDto {
  @ApiProperty()
  @IsUUID()
  hostProfileId!: string;

  @ApiProperty()
  @IsUUID()
  planId!: string;

  @ApiPropertyOptional({ description: 'Dónde y cómo se recibió el efectivo' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class ChooseFreeSlotDto {
  @ApiProperty({ description: 'Alojamiento que se conserva publicado sin plan' })
  @IsUUID()
  propertyId!: string;
}
