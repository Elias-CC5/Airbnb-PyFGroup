import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GITHUB_CLIENT_ID') as string,
      clientSecret: config.get<string>('GITHUB_CLIENT_SECRET') as string,
      callbackURL: config.get<string>('GITHUB_CALLBACK_URL') as string,
      scope: ['user:email'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: any, done: (err: any, user: any) => void) {
    const { id, username, displayName, photos, emails } = profile;
    const [firstName, ...rest] = (displayName ?? username ?? 'Usuario').split(' ');
    const user = {
      githubId: id,
      email: emails?.[0]?.value ?? `${username}@users.noreply.github.com`,
      firstName,
      lastName: rest.join(' '),
      avatarUrl: photos?.[0]?.value,
    };
    done(null, user);
  }
}