import { CanActivate, type ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { REQUIRED_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AuthenticatedUser } from '../auth.types';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

/**
 * Global guard, runs AFTER JwtAuthGuard. If a route declares
 * `@RequirePermissions('foo.bar', 'foo.baz')`, the user MUST hold ALL listed
 * permissions (AND semantics).
 *
 * - Routes without `@RequirePermissions` are allowed.
 * - `@Public()` routes are skipped (they may not have `req.user`).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const required = this.reflector.getAllAndOverride<readonly string[] | undefined>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const user = req.user;
    if (!user) {
      // Should never happen — JwtAuthGuard runs first. Defensive.
      throw new ForbiddenException('No authenticated user');
    }

    const missing = required.filter((code) => !user.permissions.has(code));
    if (missing.length > 0) {
      throw new ForbiddenException(`Missing required permission(s): ${missing.join(', ')}`);
    }
    return true;
  }
}
