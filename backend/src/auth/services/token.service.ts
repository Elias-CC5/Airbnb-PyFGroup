import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AuthTokens, JwtPayload } from '../interfaces/authenticated-user.interface';
import { PasswordService } from './password.service';

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
  async rotate(oldToken: string, user: { id: string; email: string; role: Role }, meta = {}) {
    await this.revoke(oldToken);
    return this.issue(user, meta);
  }

  async isActive(token: string): Promise<boolean> {
    const record = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash: this.passwords.sha256(token),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });
    return Boolean(record);
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
}
