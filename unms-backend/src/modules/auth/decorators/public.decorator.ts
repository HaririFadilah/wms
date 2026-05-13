import { SetMetadata } from '@nestjs/common';

/**
 * Marks a route or controller as accessible without a JWT.
 *
 * Used by {@link JwtAuthGuard} (registered globally) to skip token validation.
 */
export const IS_PUBLIC_KEY = 'auth:isPublic';
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
