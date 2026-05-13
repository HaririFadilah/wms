// Type contracts shared by AuthService / JwtStrategy / decorators.

export type TokenType = 'access' | 'refresh';

/** Payload signed into the JWT. Kept small on purpose. */
export interface JwtPayload {
  /** subject — user id (stringified BigInt) */
  sub: string;
  type: TokenType;
  /** Issued-at and exp are set by @nestjs/jwt itself. */
}

/** Already-authenticated user attached to the request after JwtAuthGuard. */
export interface AuthenticatedUser {
  id: bigint;
  email: string;
  username: string;
  fullName: string;
  status: 'active' | 'inactive' | 'suspended';
  /** Flat list of permission codes the user effectively has (union over roles). */
  permissions: Set<string>;
  /** Role names. */
  roles: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  status: AuthenticatedUser['status'];
  roles: string[];
  permissions: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  /** Seconds until access token expires. */
  expiresIn: number;
}

export interface LoginResult extends TokenPair {
  user: UserProfile;
}
