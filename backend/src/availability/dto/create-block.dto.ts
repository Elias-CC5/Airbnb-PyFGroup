import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBlockDto {
  @ApiProperty({ example: '2026-09-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-09-05' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 'Mantenimiento' })
  @IsOptional() @IsString() @MaxLength(160)
  reason?: string;
}
