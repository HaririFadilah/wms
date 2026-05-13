import { Test } from '@nestjs/testing';
import { type INestApplication, ValidationPipe, Controller, Get } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { PrismaModule } from '@/database/prisma.module';
import { PrismaService } from '@/database/prisma.service';
import { validateEnv } from '@/config/env.validation';
import { AuthModule } from './auth.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermissions } from './decorators/require-permissions.decorator';

const dbAvailable = !!process.env.DATABASE_URL;
const describeOrSkip = dbAvailable ? describe : describe.skip;

// Set up env defaults so JWT module can boot under jest.
process.env.JWT_ACCESS_SECRET ??= 'integration-test-access-secret-32chars';
process.env.JWT_REFRESH_SECRET ??= 'integration-test-refresh-secret-32chars';
process.env.JWT_ACCESS_TTL ??= '900';
process.env.JWT_REFRESH_TTL ??= '604800';

// Side-controller that requires a specific seeded permission. Used to assert
// PermissionsGuard works end-to-end (not just unit).
@Controller('test-perm')
class TestPermissionController {
  @Get('public-thing')
  @RequirePermissions('customer.read')
  publicThing() {
    return { ok: true };
  }

  @Get('forbidden-thing')
  @RequirePermissions('nonexistent.permission')
  forbiddenThing() {
    return { ok: true };
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: { requestId?: string };
}

interface LoginPayload {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: {
    id: string;
    email: string;
    username: string;
    permissions: string[];
    roles: string[];
  };
}

describeOrSkip('Auth (integration / real MySQL)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          validate: validateEnv,
          envFilePath: ['.env', '.env.local'],
        }),
        PrismaModule,
        AuthModule,
      ],
      controllers: [TestPermissionController],
      providers: [
        {
          provide: APP_PIPE,
          useFactory: () =>
            new ValidationPipe({
              whitelist: true,
              transform: true,
              forbidNonWhitelisted: true,
              transformOptions: { enableImplicitConversion: true },
            }),
        },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: PermissionsGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    // sanity: seed must have already inserted admin@unms.local in BE-0004
    const seeded = await prisma.user.findUnique({ where: { email: 'admin@unms.local' } });
    if (!seeded) {
      throw new Error(
        'Integration test requires the BE-0004 seed (admin@unms.local). Run `npm run prisma:seed` first.',
      );
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('returns tokens + profile for valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ usernameOrEmail: 'admin@unms.local', password: 'admin123' })
        .expect(200);

      const body = res.body as ApiEnvelope<LoginPayload>;
      expect(body.success).toBe(true);
      expect(body.data?.accessToken).toBeDefined();
      expect(body.data?.refreshToken).toBeDefined();
      expect(body.data?.tokenType).toBe('Bearer');
      expect(body.data?.user.email).toBe('admin@unms.local');
      // superadmin holds all 53 seeded permissions
      expect(body.data?.user.permissions.length).toBeGreaterThanOrEqual(50);
      expect(body.data?.user.permissions).toContain('customer.read');
    });

    it('accepts username as identifier (not just email)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ usernameOrEmail: 'superadmin', password: 'admin123' })
        .expect(200);
      const body = res.body as ApiEnvelope<LoginPayload>;
      expect(body.data?.user.username).toBe('superadmin');
    });

    it('returns 401 for wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ usernameOrEmail: 'admin@unms.local', password: 'definitely-wrong' })
        .expect(401);
      const body = res.body as ApiEnvelope<unknown>;
      expect(body.success).toBe(false);
      expect(body.message).toMatch(/invalid credentials/i);
    });

    it('returns 401 (same shape) for unknown user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ usernameOrEmail: 'nobody@nowhere.tld', password: 'whatever' })
        .expect(401);
      const body = res.body as ApiEnvelope<unknown>;
      expect(body.message).toMatch(/invalid credentials/i);
    });

    it('returns 400 for missing fields (ValidationPipe)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ usernameOrEmail: '' })
        .expect(400);
    });
  });

  describe('GET /auth/me', () => {
    let accessToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ usernameOrEmail: 'admin@unms.local', password: 'admin123' });
      const body = res.body as ApiEnvelope<LoginPayload>;
      accessToken = body.data!.accessToken;
    });

    it('returns 401 without Authorization header', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('returns 401 for invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
    });

    it('returns user profile for valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const body = res.body as ApiEnvelope<LoginPayload['user']>;
      expect(body.data?.email).toBe('admin@unms.local');
      expect(body.data?.permissions).toContain('customer.read');
    });
  });

  describe('POST /auth/refresh', () => {
    it('issues new tokens for a valid refresh token', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ usernameOrEmail: 'admin@unms.local', password: 'admin123' });
      const loginBody = loginRes.body as ApiEnvelope<LoginPayload>;
      const refreshToken = loginBody.data!.refreshToken;

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);
      const body = res.body as ApiEnvelope<LoginPayload>;
      expect(body.data?.accessToken).toBeDefined();
      expect(body.data?.refreshToken).toBeDefined();
    });

    it('rejects an access token used as refresh', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ usernameOrEmail: 'admin@unms.local', password: 'admin123' });
      const accessToken = (loginRes.body as ApiEnvelope<LoginPayload>).data!.accessToken;

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: accessToken })
        .expect(401);
    });
  });

  describe('Global @RequirePermissions guard', () => {
    let adminToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ usernameOrEmail: 'admin@unms.local', password: 'admin123' });
      adminToken = (res.body as ApiEnvelope<LoginPayload>).data!.accessToken;
    });

    it('admin (53 perms) passes a route requiring customer.read', async () => {
      await request(app.getHttpServer())
        .get('/test-perm/public-thing')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('admin still gets 403 for a permission nobody has', async () => {
      const res = await request(app.getHttpServer())
        .get('/test-perm/forbidden-thing')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
      const body = res.body as ApiEnvelope<unknown>;
      expect(body.message).toMatch(/missing required permission/i);
    });

    it('returns 401 (not 403) when no token is given', async () => {
      await request(app.getHttpServer()).get('/test-perm/public-thing').expect(401);
    });
  });
});
