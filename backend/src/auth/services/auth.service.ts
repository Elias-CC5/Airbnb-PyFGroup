import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from '../dto';
import { AuthResult, AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

interface RequestMeta {
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
  ) {}

  // ----------------------------- registro -----------------------------
  async register(dto: RegisterDto, meta: RequestMeta = {}): Promise<AuthResult> {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Ya existe una cuenta con ese correo');

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email,
        phone: dto.phone?.trim(),
        password: await this.passwords.hash(dto.password),
        role: Role.USER,
      },
    });

    return this.buildResult(user, meta);
  }

  // ------------------------------ login -------------------------------
  async login(dto: LoginDto, meta: RequestMeta = {}): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    // Mensaje genérico: no revelamos si el correo existe (evita enumeración de usuarios).
    const invalid = new UnauthorizedException('Correo o contraseña incorrectos');
    if (!user || user.deletedAt) throw invalid;
    if (!(await this.passwords.verify(user.password, dto.password))) throw invalid;
    if (!user.isActive) throw new UnauthorizedException('Tu cuenta está desactivada');

    return this.buildResult(user, meta);
  }

  // ------------------------------ refresh -----------------------------
  async refresh(refreshToken: string, meta: RequestMeta = {}): Promise<AuthResult> {
    if (!refreshToken) throw new UnauthorizedException('Falta el refresh token');
    if (!(await this.tokens.isActive(refreshToken))) {
      throw new UnauthorizedException('Sesión expirada, inicia sesión nuevamente');
    }

    const decoded = await this.decodeRefresh(refreshToken);
    const user = await this.prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user || !user.isActive || user.deletedAt) throw new UnauthorizedException('Sesión inválida');

    const tokens = await this.tokens.rotate(refreshToken, user, meta);
    return { user: this.toPublicUser(user), tokens };
  }

  async logout(refreshToken?: string): Promise<{ message: string }> {
    if (refreshToken) await this.tokens.revoke(refreshToken);
    return { message: 'Sesión cerrada' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.tokens.revokeAllForUser(userId);
    return { message: 'Todas las sesiones fueron cerradas' };
  }

  // ------------------------- recuperar contraseña ----------------------
  /**
   * Siempre responde igual, exista o no el correo, para no filtrar usuarios.
   * En desarrollo devolvemos el token para poder probar el flujo sin email.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; devToken?: string }> {
    const generic = { message: 'Si el correo existe, enviaremos instrucciones de recuperación' };
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.deletedAt) return generic;

    const token = this.passwords.randomToken();
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash: this.passwords.sha256(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
      },
    });

    this.logger.log(`Token de recuperación generado para ${user.email}`);
    return process.env.NODE_ENV === 'production' ? generic : { ...generic, devToken: token };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const record = await this.prisma.passwordReset.findFirst({
      where: {
        tokenHash: this.passwords.sha256(dto.token),
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!record) throw new BadRequestException('El enlace de recuperación es inválido o expiró');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { password: await this.passwords.hash(dto.password) },
      }),
      this.prisma.passwordReset.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await this.tokens.revokeAllForUser(record.userId);
    return { message: 'Contraseña actualizada correctamente' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!(await this.passwords.verify(user.password, dto.currentPassword))) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: await this.passwords.hash(dto.newPassword) },
    });
    await this.tokens.revokeAllForUser(userId);
    return { message: 'Contraseña actualizada, vuelve a iniciar sesión' };
  }

  // ------------------------------ helpers ------------------------------
  async me(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });
  }

  private async buildResult(user: User, meta: RequestMeta): Promise<AuthResult> {
    const tokens = await this.tokens.issue(user, meta);
    return { user: this.toPublicUser(user), tokens };
  }

  private toPublicUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  private async decodeRefresh(token: string) {
    const [, payload] = token.split('.');
    try {
      return JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as { sub: string };
    } catch {
      throw new UnauthorizedException('Refresh token malformado');
    }
  }
}
