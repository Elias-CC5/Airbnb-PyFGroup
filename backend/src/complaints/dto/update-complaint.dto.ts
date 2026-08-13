import { ApiProperty } from '@nestjs/swagger';
import { ComplaintStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateComplaintDto {
  @ApiProperty({ enum: ComplaintStatus })
  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: ComplaintStatus;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  response?: string;
}