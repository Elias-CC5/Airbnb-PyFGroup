import { ApiProperty } from '@nestjs/swagger';
import { ComplaintType } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateComplaintDto {
  @ApiProperty({ enum: ComplaintType })
  @IsEnum(ComplaintType)
  type: ComplaintType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  docType: string; // DNI, CE, Pasaporte

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  docNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  phone?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  itemDescription: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  reservationCode?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  detail: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  request: string;
}