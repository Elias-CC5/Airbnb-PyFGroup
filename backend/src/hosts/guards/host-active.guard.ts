import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { HostStatus, Role } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../../database/prisma.service';

/**
 * Exige un perfil de anfitrión APROBADO, no sólo el rol HOST.
 *
 * El rol por sí solo no basta: un anfitrión suspendido conserva el rol pero no
 * debe poder publicar. Esta comprobación va contra la base en cada petición,
 * porque el JWT lleva el rol de cuando se emitió y puede estar desactualizado.
 * Los administradores pasan sin perfil.
 */
@Injectable()
export class HostActiveGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) throw new ForbiddenException('No autenticado');
    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) return true;

    const profile = await this.prisma.hostProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, status: true },
    });

    if (!profile) {
      throw new ForbiddenException('Necesitas ser anfitrión para hacer esto');
    }
    if (profile.status === HostStatus.PENDING) {
      throw new ForbiddenException('Tu solicitud de anfitrión todavía está en revisión');
    }
    if (profile.status === HostStatus.SUSPENDED) {
      throw new ForbiddenException('Tu cuenta de anfitrión está suspendida');
    }
    if (profile.status !== HostStatus.ACTIVE) {
      throw new ForbiddenException('Tu cuenta de anfitrión no está activa');
    }

    // Se deja a mano para no volver a consultarlo en el servicio.
    request.hostProfileId = profile.id;
    return true;
  }
}
