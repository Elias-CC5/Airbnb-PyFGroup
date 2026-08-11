import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class WhatsappLinkDto {
  @ApiPropertyOptional({ example: '2026-09-10' })
  @IsOptional() @IsDateString()
  checkIn?: string;

  @ApiPropertyOptional({ example: '2026-09-14' })
  @IsOptional() @IsDateString()
  checkOut?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  guests?: number;
}
