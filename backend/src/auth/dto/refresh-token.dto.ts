import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: 'Opcional si el refresh token viaja en cookie HttpOnly' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
