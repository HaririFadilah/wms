import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth.types';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

/**
 * Param decorator: `(@CurrentUser() user: AuthenticatedUser)`.
 * Returns the user attached by JwtAuthGuard. Throws if no user is present —
 * use `@Public()` if the endpoint doesn't need authentication.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (!req.user) {
      throw new Error(
        'CurrentUser was used on an unauthenticated request. Did you mean to add JwtAuthGuard / remove @Public()?',
      );
    }
    return req.user;
  },
);
