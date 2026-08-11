import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

/** Representación pública de un usuario (nunca expone la contraseña). */
export class UserEntity {
  @ApiProperty() id: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() email: string;
  @ApiProperty({ required: false }) phone?: string | null;
  @ApiProperty({ required: false }) avatarUrl?: string | null;
  @ApiProperty({ enum: Role }) role: Role;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
}

export const userPublicSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;
