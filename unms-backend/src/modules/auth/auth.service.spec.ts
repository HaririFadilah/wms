import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@/database/prisma.service';
import { AuthService } from './auth.service';

// Lightweight Prisma stub: we mock only the methods AuthService touches.
const makePrismaMock = () => ({
  user: {
    findFirst: jest.fn(),
    update: jest.fn().mockResolvedValue({}),
  },
});

const makeConfigMock = (overrides: Record<string, string | number> = {}) => {
  const values: Record<string, string | number> = {
    JWT_ACCESS_SECRET: 'access-secret-test',
    JWT_REFRESH_SECRET: 'refresh-secret-test',
    JWT_ACCESS_TTL: 900,
    JWT_REFRESH_TTL: 604800,
    ...overrides,
  };
  return {
    get: jest.fn((key: string) => values[key]),
  };
};

const makeJwtMock = () => ({
  sign: jest.fn((_payload, opts: { secret: string; expiresIn: number }) => {
    return `signed.${opts.secret}.${opts.expiresIn}`;
  }),
  verifyAsync: jest.fn(),
});

describe('AuthService (unit)', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let jwt: ReturnType<typeof makeJwtMock>;

  beforeEach(async () => {
    prisma = makePrismaMock();
    jwt = makeJwtMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: makeConfigMock() },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  describe('validateUser', () => {
    it('returns user id when credentials are correct', async () => {
      const hash = await bcrypt.hash('secret123', 4);
      prisma.user.findFirst.mockResolvedValue({
        id: 42n,
        passwordHash: hash,
        status: 'active',
      });
      const id = await service.validateUser('admin@unms.local', 'secret123');
      expect(id).toBe(42n);
    });

    it('returns null when user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const id = await service.validateUser('nobody@unms.local', 'whatever');
      expect(id).toBeNull();
    });

    it('returns null when password is wrong', async () => {
      const hash = await bcrypt.hash('secret123', 4);
      prisma.user.findFirst.mockResolvedValue({
        id: 42n,
        passwordHash: hash,
        status: 'active',
      });
      const id = await service.validateUser('admin@unms.local', 'wrong-pw');
      expect(id).toBeNull();
    });

    it('returns null when user is inactive', async () => {
      const hash = await bcrypt.hash('secret123', 4);
      prisma.user.findFirst.mockResolvedValue({
        id: 42n,
        passwordHash: hash,
        status: 'suspended',
      });
      const id = await service.validateUser('admin@unms.local', 'secret123');
      expect(id).toBeNull();
    });

    it('trims whitespace from the identifier', async () => {
      const hash = await bcrypt.hash('secret123', 4);
      prisma.user.findFirst.mockResolvedValue({
        id: 42n,
        passwordHash: hash,
        status: 'active',
      });
      const id = await service.validateUser('  admin@unms.local  ', 'secret123');
      expect(id).toBe(42n);
      const calls = prisma.user.findFirst.mock.calls as unknown as Array<
        [{ where: { OR: Array<{ email?: string; username?: string }> } }]
      >;
      expect(calls[0][0].where.OR).toEqual([
        { email: 'admin@unms.local' },
        { username: 'admin@unms.local' },
      ]);
    });
  });

  describe('hydrateAuthenticatedUser', () => {
    it('flattens roles+permissions into a set', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 1n,
        email: 'admin@unms.local',
        username: 'admin',
        fullName: 'Admin',
        status: 'active',
        roles: [
          {
            role: {
              name: 'admin',
              permissions: [
                { permission: { code: 'customer.read' } },
                { permission: { code: 'customer.update' } },
              ],
            },
          },
          {
            role: {
              name: 'finance',
              permissions: [
                { permission: { code: 'customer.read' } }, // dup
                { permission: { code: 'invoice.read' } },
              ],
            },
          },
        ],
      });
      const user = await service.hydrateAuthenticatedUser(1n);
      expect(user).not.toBeNull();
      expect(user!.roles).toEqual(['admin', 'finance']);
      expect([...user!.permissions].sort()).toEqual([
        'customer.read',
        'customer.update',
        'invoice.read',
      ]);
    });

    it('returns null when user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const user = await service.hydrateAuthenticatedUser(99n);
      expect(user).toBeNull();
    });

    it('returns null when user inactive', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 1n,
        email: 'x',
        username: 'x',
        fullName: 'x',
        status: 'suspended',
        roles: [],
      });
      const user = await service.hydrateAuthenticatedUser(1n);
      expect(user).toBeNull();
    });
  });

  describe('login', () => {
    it('issues token pair + profile', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 1n,
        email: 'admin@unms.local',
        username: 'admin',
        fullName: 'Admin',
        status: 'active',
        roles: [],
      });
      const res = await service.login(1n);
      expect(res.accessToken).toContain('access-secret-test');
      expect(res.refreshToken).toContain('refresh-secret-test');
      expect(res.tokenType).toBe('Bearer');
      expect(res.expiresIn).toBe(900);
      expect(res.user.email).toBe('admin@unms.local');
      expect(prisma.user.update).toHaveBeenCalledTimes(1);
      const call = prisma.user.update.mock.calls[0] as unknown as Array<{
        where: { id: bigint };
        data: { failedLoginAttempts: number };
      }>;
      expect(call[0].where).toEqual({ id: 1n });
      expect(call[0].data.failedLoginAttempts).toBe(0);
    });

    it('throws when user not available', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.login(99n)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('returns new tokens when refresh is valid', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: '1', type: 'refresh' });
      prisma.user.findFirst.mockResolvedValue({ id: 1n });
      const res = await service.refresh('any-refresh-jwt');
      expect(res.accessToken).toBeDefined();
      expect(res.refreshToken).toBeDefined();
    });

    it('rejects access tokens used as refresh', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: '1', type: 'access' });
      await expect(service.refresh('access-token')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects when underlying user is gone', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: '1', type: 'refresh' });
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.refresh('any')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects malformed tokens', async () => {
      jwt.verifyAsync.mockRejectedValue(new Error('bad signature'));
      await expect(service.refresh('garbage')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
