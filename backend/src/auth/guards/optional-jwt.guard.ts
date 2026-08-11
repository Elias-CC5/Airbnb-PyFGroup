import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

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