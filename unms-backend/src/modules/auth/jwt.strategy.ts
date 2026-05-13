import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { EnvironmentVariables } from '@/config/env.validation';
import type { AuthenticatedUser, JwtPayload } from './auth.types';
import { AuthService } from './auth.service';

/**
 * passport-jwt strategy. Decodes Bearer access tokens, then asks {@link AuthService}
 * to hydrate the full user (with permissions) by id. Hydration runs PER REQUEST.
 *
 * If this becomes a hotspot we can cache the hydrated user keyed by `sub` in
 * Redis with a short TTL; that's an explicit Sprint-3 optimization.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService<EnvironmentVariables, true>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: String(config.get('JWT_ACCESS_SECRET', { infer: true })),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Wrong token type');
    }

    const userId = BigInt(payload.sub);
    const user = await this.authService.hydrateAuthenticatedUser(userId);
    if (!user) {
      throw new UnauthorizedException('User no longer exists or is inactive');
    }
    return user;
  }
}
