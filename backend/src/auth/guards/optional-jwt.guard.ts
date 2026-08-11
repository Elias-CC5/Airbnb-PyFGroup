import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Permite el acceso anónimo pero adjunta `req.user` si hay un token válido.
 * Útil en el listado público de alojamientos para marcar favoritos.
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  /** Nunca lanza: si no hay token o es inválido, simplemente no hay usuario. */
  handleRequest<TUser = unknown>(_err: unknown, user: unknown): TUser {
    return (user ?? null) as TUser;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context) as boolean;
  }
}