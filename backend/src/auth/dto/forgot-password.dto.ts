import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ana@correo.com' })
  @IsEmail()
  @Transform(({ value }) => String(value).trim().toLowerCase())
  email: string;
}
