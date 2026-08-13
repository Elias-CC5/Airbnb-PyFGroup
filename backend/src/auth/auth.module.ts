import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtGuard } from './guards/optional-jwt.guard';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';

@Module({
  imports: [ConfigModule, PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    PasswordService,
    JwtStrategy,
    GoogleStrategy,
    GithubStrategy,
    JwtAuthGuard,
    OptionalJwtGuard,
  ],
  exports: [AuthService, PasswordService, TokenService, JwtAuthGuard, OptionalJwtGuard],
})
export class AuthModule {}