import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AuthTokens, JwtPayload } from '../interfaces/authenticated-user.interface';
import { PasswordService } from './password.service';

/**
 * Ventana durante la cual un refresh token recién rotado sigue siendo aceptado.
 * Evita cerrar la sesión cuando dos peticiones concurrentes —dos pestañas, una
 * recarga rápida o el doble montaje de efectos en desarrollo— usan el mismo token.
 */
const ROTATION_GRACE_MS = 15_000;

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
  ) {}

  async issue(
    user: { id: string; email: string; role: Role },
    meta: { userAgent?: string; ip?: string } = {},
  ): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.secret'),
      expiresIn: this.config.get<string>('jwt.expiresIn'),
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
    });

    const decoded = this.jwt.decode(refreshToken) as JwtPayload;

    // El token se guarda hasheado: si alguien lee la tabla, no obtiene credenciales.
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.passwords.sha256(refreshToken),
        expiresAt: new Date((decoded.exp ?? 0) * 1000),
        userAgent: meta.userAgent?.slice(0, 255),
        ip: meta.ip?.slice(0, 64),
      },
    });

    const access = this.jwt.decode(accessToken) as JwtPayload;

    return {
      accessToken,
      refreshToken,
      expiresIn: (access.exp ?? 0) - Math.floor(Date.now() / 1000),
    };
  }

  /** Rotación: invalida el refresh usado y emite un par nuevo. */
  async rotate(
    oldToken: string,
    user: { id: string; email: string; role: Role },
    meta: { userAgent?: string; ip?: string } = {},
  ): Promise<AuthTokens> {
    await this.revoke(oldToken);
    return this.issue(user, meta);
  }

  /**
   * Un token es válido si no ha expirado y no está revocado; o si acaba de
   * revocarse dentro de la ventana de gracia, que indica una carrera y no un robo.
   */
  async isActive(token: string): Promise<boolean> {
    const record = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash: this.passwords.sha256(token),
        expiresAt: { gt: new Date() },
      },
      select: { revokedAt: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return false;
    if (!record.revokedAt) return true;

    return Date.now() - record.revokedAt.getTime() < ROTATION_GRACE_MS;
  }

  async revoke(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.passwords.sha256(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Limpieza de tokens caducados o revocados hace tiempo. Útil como tarea programada. */
  async purgeExpired(): Promise<number> {
    const { count } = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        ],
      },
    });
    return count;
  }
}