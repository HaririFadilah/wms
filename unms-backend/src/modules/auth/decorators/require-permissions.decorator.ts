import { SetMetadata } from '@nestjs/common';

/**
 * Require the caller to possess **all** the listed permission codes
 * (e.g. `'customer.read'`, `'invoice.update'`).
 *
 * Permission codes match what BE-0004 seeded into the `permissions` table.
 * Resolved by {@link PermissionsGuard} (registered globally, runs after JwtAuthGuard).
 *
 * Example:
 *   @RequirePermissions('customer.read')
 *   findAll() { ... }
 *
 *   @RequirePermissions('service.provision', 'service.update')
 *   provision() { ... }
 *
 * If you need OR semantics, split into separate handlers or check inside the handler.
 */
export const REQUIRED_PERMISSIONS_KEY = 'auth:requiredPermissions';
export const RequirePermissions = (
  ...permissions: readonly string[]
): MethodDecorator & ClassDecorator => SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
