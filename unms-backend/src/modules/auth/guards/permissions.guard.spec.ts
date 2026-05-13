import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { REQUIRED_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AuthenticatedUser } from '../auth.types';

const makeUser = (perms: string[]): AuthenticatedUser => ({
  id: 1n,
  email: 'x',
  username: 'x',
  fullName: 'x',
  status: 'active',
  roles: [],
  permissions: new Set(perms),
});

const makeContext = (
  metadata: Record<string, unknown>,
  user: AuthenticatedUser | undefined,
): ExecutionContext => {
  const ctx = {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({ name: 'h' }),
    getClass: () => ({ name: 'c' }),
  } as unknown as ExecutionContext;
  void metadata;
  return ctx;
};

const makeReflector = (metadata: Record<string, unknown>): Reflector =>
  ({
    getAllAndOverride: jest.fn((key: string) => metadata[key]),
  }) as unknown as Reflector;

describe('PermissionsGuard', () => {
  it('allows when route has no @RequirePermissions metadata', () => {
    const reflector = makeReflector({});
    const guard = new PermissionsGuard(reflector);
    const ctx = makeContext({}, makeUser([]));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows when user has all required permissions', () => {
    const reflector = makeReflector({
      [REQUIRED_PERMISSIONS_KEY]: ['customer.read', 'customer.update'],
    });
    const guard = new PermissionsGuard(reflector);
    const ctx = makeContext({}, makeUser(['customer.read', 'customer.update', 'extra.perm']));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws ForbiddenException listing missing perms', () => {
    const reflector = makeReflector({
      [REQUIRED_PERMISSIONS_KEY]: ['customer.read', 'customer.delete'],
    });
    const guard = new PermissionsGuard(reflector);
    const ctx = makeContext({}, makeUser(['customer.read']));
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(ctx)).toThrow(/customer\.delete/);
  });

  it('skips when route is @Public()', () => {
    const reflector = makeReflector({
      [IS_PUBLIC_KEY]: true,
      [REQUIRED_PERMISSIONS_KEY]: ['anything'],
    });
    const guard = new PermissionsGuard(reflector);
    // No user (public route would not have one)
    const ctx = makeContext({}, undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws when authenticated guard somehow let through without user', () => {
    const reflector = makeReflector({
      [REQUIRED_PERMISSIONS_KEY]: ['x'],
    });
    const guard = new PermissionsGuard(reflector);
    const ctx = makeContext({}, undefined);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
