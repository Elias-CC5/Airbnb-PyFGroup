import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString() @MinLength(2) @MaxLength(80)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MinLength(2) @MaxLength(80)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUrl()
  avatarUrl?: string;
}
