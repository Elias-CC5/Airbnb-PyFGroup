import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { CurrentUser, Public } from '../../common/decorators';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from '../dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthResult } from '../interfaces/authenticated-user.interface';
import { AuthService } from '../services/auth.service';

const REFRESH_COOKIE = 'refresh_token';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Crear una cuenta nueva' })
  async register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto, this.meta(req));
    return this.withCookie(res, result);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto, this.meta(req));
    return this.withCookie(res, result);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar el access token (rota el refresh token)' })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = dto.refreshToken ?? (req.cookies?.[REFRESH_COOKIE] as string | undefined);
    const result = await this.authService.refresh(token as string, this.meta(req));
    return this.withCookie(res, result);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión e invalidar el refresh token' })
  async logout(@Body() dto: RefreshTokenDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = dto.refreshToken ?? (req.cookies?.[REFRESH_COOKIE] as string | undefined);
    // Debe repetir sameSite/secure o el navegador no la borra.
    const { maxAge: _ignored, ...options } = this.cookieOptions();
    res.clearCookie(REFRESH_COOKIE, options);
    return this.authService.logout(token);
  }

  // --------------------------- login social (Google) --------------------
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Inicia el flujo OAuth de Google' })
  googleAuth() {
    // Passport redirige automáticamente a Google.
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.oauthLogin(req.user as any, this.meta(req));
    this.redirectWithToken(res, result);
  }

  // --------------------------- login social (GitHub) --------------------
  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Inicia el flujo OAuth de GitHub' })
  githubAuth() {
    // Passport redirige automáticamente a GitHub.
  }

  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.oauthLogin(req.user as any, this.meta(req));
    this.redirectWithToken(res, result);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300_000 } })
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña con el token recibido' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Perfil del usuario autenticado' })
  me(@CurrentUser('id') userId: string) {
    return this.authService.me(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  logoutAll(@CurrentUser('id') userId: string) {
    return this.authService.logoutAll(userId);
  }

  // ------------------------------ helpers ------------------------------
  private meta(req: Request) {
    return { userAgent: req.headers['user-agent'], ip: req.ip };
  }

  /**
   * El refresh token viaja además en cookie HttpOnly (defensa contra XSS).
   * El access token se devuelve en el body para que el cliente lo mantenga en memoria.
   */
  private withCookie(res: Response, result: AuthResult): AuthResult {
    res.cookie(REFRESH_COOKIE, result.tokens.refreshToken, this.cookieOptions());
    return result;
  }

  /**
   * En producción el frontend (Vercel) y la API (Render) viven en dominios
   * distintos, así que la cookie es "de terceros": con SameSite=Lax el
   * navegador no la envía en las peticiones fetch y la sesión se pierde.
   * SameSite=None exige Secure, de ahí que ambos vayan juntos.
   */
  private cookieOptions() {
    const secure = this.config.get<boolean>('jwt.cookieSecure') ?? false;
    return {
      httpOnly: true,
      sameSite: secure ? ('none' as const) : ('lax' as const),
      secure,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }

  /**
   * Usado por los callbacks de OAuth (Google/GitHub): en vez de devolver JSON,
   * redirige de vuelta al frontend con el access token en la URL.
   */
  private redirectWithToken(res: Response, result: AuthResult) {
    res.cookie(REFRESH_COOKIE, result.tokens.refreshToken, this.cookieOptions());
    const frontendUrl = this.config.get<string>('app.frontendUrl') ?? 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.tokens.accessToken}`);
  }
}