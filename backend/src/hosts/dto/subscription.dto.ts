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
  Matches,
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

  @ApiPropertyOptional({ description: 'Captura del pago alojada en otro sitio' })
  @IsOptional()
  @IsUrl()
  proofUrl?: string;

  /**
   * Captura del Yape/Plin como data URI (`data:image/png;base64,...`).
   *
   * Viaja dentro del JSON en vez de como multipart porque el proyecto no tiene
   * almacenamiento de archivos: la imagen no se guarda, se adjunta al correo
   * que reciben los administradores y se descarta. El tope de 6.000.000
   * caracteres son unos 4,5 MB de foto, de sobra para una captura de celular.
   */
  @ApiPropertyOptional({ description: 'Captura del pago en base64 (data URI)' })
  @IsOptional()
  @IsString()
  @Matches(/^data:image\/(png|jpe?g|webp|heic);base64,[A-Za-z0-9+/=]+$/, {
    message: 'La captura debe ser una imagen (PNG, JPG, WEBP o HEIC)',
  })
  @MaxLength(6_000_000, { message: 'La captura pesa demasiado. Envía una imagen más liviana.' })
  proofImage?: string;

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
