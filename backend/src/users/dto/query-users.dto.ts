import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryUsersDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Busca por nombre, apellido o correo' })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional() @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
