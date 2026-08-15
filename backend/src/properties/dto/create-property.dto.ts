import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BedType, CancellationPolicy, Currency, PropertyStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateLocationDto } from '../../locations/dto';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Casa moderna con vista al valle' })
  @IsString() @MinLength(6) @MaxLength(160)
  title: string;

  @ApiPropertyOptional({ example: 'Ideal para familias, a 10 min del centro' })
  @IsOptional() @IsString() @MaxLength(255)
  shortDescription?: string;

  @ApiProperty()
  @IsString() @MinLength(40, { message: 'La descripción debe tener al menos 40 caracteres' })
  description: string;

  @ApiProperty({ example: 250 })
  @Type(() => Number) @IsNumber() @Min(1)
  pricePerNight: number;

  @ApiPropertyOptional({ enum: Currency, default: Currency.PEN })
  @IsOptional() @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({ example: 30, default: 0 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  cleaningFee?: number;

  @ApiProperty({ example: 6 })
  @Type(() => Number) @IsInt() @Min(1)
  maxGuests: number;

  @ApiProperty({ example: 3 })
  @Type(() => Number) @IsInt() @Min(0)
  bedrooms: number;

  @ApiPropertyOptional({ example: 4, default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  beds?: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number) @IsInt() @Min(1)
  bathrooms: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  minNights?: number;

  @ApiPropertyOptional()
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  maxNights?: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number) @IsInt()
  categoryId: number;

  @ApiProperty({ type: CreateLocationDto })
  @ValidateNested() @Type(() => CreateLocationDto)
  location: CreateLocationDto;

  @ApiPropertyOptional({ type: [Number], example: [1, 2, 5] })
  @IsOptional() @IsArray() @Type(() => Number) @IsInt({ each: true })
  amenityIds?: number[];

  @ApiPropertyOptional({ enum: PropertyStatus, default: PropertyStatus.DRAFT })
  @IsOptional() @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiPropertyOptional({ example: '' })
  @IsOptional() @IsString() @MaxLength(30)
  whatsappPhone?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: '15:00' })
  @IsOptional() @IsString() @MaxLength(5)
  checkInTime?: string;

  @ApiPropertyOptional({ example: '11:00' })
  @IsOptional() @IsString() @MaxLength(5)
  checkOutTime?: string;

  // --------------------------- reglas de la casa ---------------------------
  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  petsAllowed?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  smokingAllowed?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  partiesAllowed?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  suitableForChildren?: boolean;

  @ApiPropertyOptional({ example: '22:00' })
  @IsOptional() @IsString() @MaxLength(5)
  quietHoursFrom?: string;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional() @IsString() @MaxLength(5)
  quietHoursTo?: string;

  @ApiPropertyOptional({ example: 'Prohibido subir muebles a la terraza.' })
  @IsOptional() @IsString() @MaxLength(2000)
  houseRules?: string;

  // -------------------------- detalles del espacio -------------------------
  @ApiPropertyOptional({ example: 85 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  areaM2?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  floor?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  hasElevator?: boolean;

  @ApiPropertyOptional({ enum: BedType })
  @IsOptional() @IsEnum(BedType)
  bedType?: BedType;

  @ApiPropertyOptional({ example: 'Vista al parque' })
  @IsOptional() @IsString() @MaxLength(60)
  viewType?: string;

  // ---------------------------- políticas y cobros -------------------------
  @ApiPropertyOptional({ enum: CancellationPolicy, default: CancellationPolicy.MODERATE })
  @IsOptional() @IsEnum(CancellationPolicy)
  cancellationPolicy?: CancellationPolicy;

  @ApiPropertyOptional({ example: 200, default: 0 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  securityDeposit?: number;

  @ApiPropertyOptional({ example: 40, default: 0 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  extraGuestFee?: number;

  @ApiPropertyOptional({ example: 10, description: 'Descuento % por 7 noches o más' })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(90)
  weeklyDiscount?: number;

  @ApiPropertyOptional({ example: 25, description: 'Descuento % por 28 noches o más' })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(90)
  monthlyDiscount?: number;
}
