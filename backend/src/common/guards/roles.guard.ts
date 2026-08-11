import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../constants';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';

/** Jerarquía: cuanto mayor el número, más permisos. */
const HIERARCHY: Record<Role, number> = {
  USER: 1,
  HOST: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as AuthenticatedUser | undefined;
    if (!user) throw new ForbiddenException('No autenticado');

    const userLevel = HIERARCHY[user.role] ?? 0;
    const minRequired = Math.min(...required.map((r) => HIERARCHY[r] ?? 99));

    if (userLevel < minRequired) {
      throw new ForbiddenException('No tienes permisos para realizar esta acción');
    }
    return true;
  }
}
