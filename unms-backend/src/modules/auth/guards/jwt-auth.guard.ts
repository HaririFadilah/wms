import { Injectable, type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AuthenticatedUser } from '../auth.types';

/**
 * Global guard registered via `APP_GUARD` in AppModule.
 *
 * - Skips routes / classes annotated with `@Public()`.
 * - Otherwise delegates to passport-jwt strategy `'jwt'`.
 * - Throws `UnauthorizedException` (mapped to 401 by AllExceptionsFilter) on
 *   missing/invalid/expired tokens.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): ReturnType<typeof AuthGuard.prototype.canActivate> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<TUser extends AuthenticatedUser = AuthenticatedUser>(
    err: Error | null,
    user: TUser | false,
  ): TUser {
    if (err || !user) {
      throw err ?? new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
