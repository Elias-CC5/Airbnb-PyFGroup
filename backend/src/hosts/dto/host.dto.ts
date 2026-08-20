import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HostApplicationStatus, IdDocumentType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** Solicitud para convertirse en anfitrión. */
export class CreateHostApplicationDto {
  @ApiProperty({ example: 'Carlos Alberto Ramírez Soto' })
  @Transform(trim)
  @IsString()
  @Length(5, 160)
  fullName!: string;

  @ApiProperty({ example: '+51 987 654 321' })
  @Transform(trim)
  @IsString()
  @Matches(/^\+?[\d\s()-]{6,30}$/, { message: 'El teléfono no tiene un formato válido' })
  phone!: string;

  @ApiProperty({ enum: IdDocumentType, example: IdDocumentType.DNI })
  @IsEnum(IdDocumentType)
  documentType!: IdDocumentType;

  @ApiProperty({ example: '45678912', description: 'DNI de 8 dígitos, CE o pasaporte' })
  @Transform(trim)
  @IsString()
  @Length(6, 20)
  documentNumber!: string;

  @ApiPropertyOptional({ example: 'Arquitecto independiente' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  occupation?: string;

  @ApiProperty({
    example: 'Tengo dos departamentos en Miraflores que alquilo por temporadas…',
  })
  @Transform(trim)
  @IsString()
  @Length(30, 1000, {
    message: 'Cuéntanos un poco más: al menos 30 caracteres',
  })
  motivation!: string;

  @ApiPropertyOptional({ example: 'Lima' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(80)
  city?: string;

  @ApiPropertyOptional({ description: 'URL de la foto del documento (anverso)' })
  @IsOptional()
  @IsUrl()
  documentFrontUrl?: string;

  @ApiPropertyOptional({ description: 'URL de la foto del documento (reverso)' })
  @IsOptional()
  @IsUrl()
  documentBackUrl?: string;

  @ApiPropertyOptional({ description: 'Selfie sosteniendo el documento' })
  @IsOptional()
  @IsUrl()
  selfieUrl?: string;
}

/** Resolución del administrador sobre una solicitud. */
export class ReviewHostApplicationDto {
  @ApiProperty({ enum: [HostApplicationStatus.APPROVED, HostApplicationStatus.REJECTED] })
  @IsEnum(HostApplicationStatus)
  status!: HostApplicationStatus;

  @ApiPropertyOptional({ description: 'Obligatorio al rechazar' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}

export class SuspendHostDto {
  @ApiProperty({ example: 'Reportes reiterados de huéspedes' })
  @Transform(trim)
  @IsString()
  @Length(10, 500)
  reason!: string;
}

/** Datos que el anfitrión puede editar de su propio perfil público. */
export class UpdateHostProfileDto {
  @ApiPropertyOptional({ example: 'Carlos R.' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(2, 80)
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @ApiPropertyOptional({ example: 'Cusco' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(80)
  city?: string;

  @ApiPropertyOptional({ example: 'Perú' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(60)
  country?: string;

  @ApiPropertyOptional({ example: ['es', 'en'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ example: '+51 987 654 321' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @Matches(/^\+?[\d\s()-]{6,30}$/, { message: 'El teléfono no tiene un formato válido' })
  whatsapp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsEmail()
  contactEmail?: string;
}

export class UpdateHostSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyOnReservation?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyOnCancel?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyOnReview?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyByEmail?: boolean;
}
