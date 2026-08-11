import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Ana' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  firstName: string;

  @ApiProperty({ example: 'Quispe' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  lastName: string;

  @ApiProperty({ example: 'ana@correo.com' })
  @IsEmail({}, { message: 'El correo no es válido' })
  @Transform(({ value }) => String(value).trim().toLowerCase())
  email: string;

  @ApiProperty({ example: '+51 999 888 777', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiProperty({ example: 'MiClave123!' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe incluir mayúscula, minúscula y número',
  })
  password: string;
}
