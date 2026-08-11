import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@wasi.pe' })
  @IsEmail({}, { message: 'El correo no es válido' })
  @Transform(({ value }) => String(value).trim().toLowerCase())
  email: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(8)
  password: string;
}
