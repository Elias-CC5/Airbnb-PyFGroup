import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') as string,
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') as string,
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL') as string,
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback) {
    const { name, emails, photos, id } = profile;
    const user = {
      googleId: id,
      email: emails[0].value,
      firstName: name?.givenName ?? 'Usuario',
      lastName: name?.familyName ?? '',
      avatarUrl: photos?.[0]?.value,
    };
    done(null, user);
  }
}