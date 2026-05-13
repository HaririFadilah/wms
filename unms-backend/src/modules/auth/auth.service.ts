import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { EnvironmentVariables } from '@/config/env.validation';
import { PrismaService } from '@/database/prisma.service';
import type {
  AuthenticatedUser,
  JwtPayload,
  LoginResult,
  TokenPair,
  TokenType,
  UserProfile,
} from './auth.types';

/**
 * Core auth flows used by the AuthController and JwtStrategy.
 *
 * Defer to BE-0202+:
 *  - Refresh-token revocation list (logout makes refresh tokens still valid until exp)
 *  - failed_login_attempts / lockedUntil enforcement (schema already exists)
 *  - Password change / reset endpoints
 *  - Login audit log into `audit_logs`
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  /**
   * Look up by email OR username, verify password. Returns `null` on any failure
   * (don't leak which step failed — caller maps to 401 with a constant message).
   */
  async validateUser(usernameOrEmail: string, password: string): Promise<bigint | null> {
    const normalized = usernameOrEmail.trim();
    const user = await this.prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [{ email: normalized }, { username: normalized }],
      },
      select: {
        id: true,
        passwordHash: true,
        status: true,
      },
    });
    if (!user) {
      // Constant-time-ish: still run bcrypt against a known hash so timing leak is reduced.
      await bcrypt.compare(password, '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinva');
      return null;
    }
    if (user.status !== 'active') {
      return null;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return null;
    }
    return user.id;
  }

  /** Issue tokens + return user profile after a successful credentials check. */
  async login(userId: bigint): Promise<LoginResult> {
    const profile = await this.buildUserProfile(userId);
    if (!profile) {
      throw new UnauthorizedException('User not available');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date(), failedLoginAttempts: 0 },
    });

    const tokens = this.signTokenPair(userId);
    return { ...tokens, user: profile };
  }

  /** Verify a refresh token signature/type, issue a fresh access token. */
  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      const refreshSecret = String(this.config.get('JWT_REFRESH_SECRET', { infer: true }));
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Wrong token type for refresh');
    }
    const userId = BigInt(payload.sub);

    // Ensure user still exists & active.
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null, status: 'active' },
      select: { id: true },
    });
    if (!user) {
      throw new UnauthorizedException('User no longer available');
    }
    return this.signTokenPair(userId);
  }

  /**
   * Hydrate a full {@link AuthenticatedUser} (with role + permission set) by id.
   * Called per-request by JwtStrategy.
   * Returns `null` if user is missing / soft-deleted / inactive.
   */
  async hydrateAuthenticatedUser(userId: bigint): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        status: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
                permissions: {
                  select: { permission: { select: { code: true } } },
                },
              },
            },
          },
        },
      },
    });
    if (!user || user.status !== 'active') {
      return null;
    }

    const roles: string[] = [];
    const permissions = new Set<string>();
    for (const { role } of user.roles) {
      roles.push(role.name);
      for (const { permission } of role.permissions) {
        permissions.add(permission.code);
      }
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      status: user.status,
      roles,
      permissions,
    };
  }

  /** Public projection of a user (no hash). */
  async buildUserProfile(userId: bigint): Promise<UserProfile | null> {
    const hydrated = await this.hydrateAuthenticatedUser(userId);
    if (!hydrated) return null;
    return {
      id: hydrated.id.toString(),
      email: hydrated.email,
      username: hydrated.username,
      fullName: hydrated.fullName,
      status: hydrated.status,
      roles: hydrated.roles,
      permissions: [...hydrated.permissions].sort(),
    };
  }

  private signTokenPair(userId: bigint): TokenPair {
    const accessTtl = Number(this.config.get('JWT_ACCESS_TTL', { infer: true }));
    const refreshTtl = Number(this.config.get('JWT_REFRESH_TTL', { infer: true }));
    const accessSecret = String(this.config.get('JWT_ACCESS_SECRET', { infer: true }));
    const refreshSecret = String(this.config.get('JWT_REFRESH_SECRET', { infer: true }));

    const accessToken = this.signToken(userId, 'access', {
      secret: accessSecret,
      expiresIn: accessTtl,
    });
    const refreshToken = this.signToken(userId, 'refresh', {
      secret: refreshSecret,
      expiresIn: refreshTtl,
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessTtl,
    };
  }

  private signToken(userId: bigint, type: TokenType, opts: JwtSignOptions): string {
    const payload: JwtPayload = { sub: userId.toString(), type };
    return this.jwt.sign(payload, opts);
  }
}
