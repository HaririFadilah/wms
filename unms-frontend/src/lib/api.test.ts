import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { makeServer } from '@/test-utils/server';
import { resetAuthStore, seedAuthStore } from '@/test-utils/store';
import { useAuthStore } from '@/stores/auth.store';
import { authEvents } from '@/lib/auth-events';
import { authApi } from '@/lib/api-routes';
import { ApiClientError } from '@/lib/api';

const BASE = 'http://localhost:3001/api/v1';

const envelopeOk = <T>(data: T, message = 'ok') => ({
  success: true,
  message,
  data,
  meta: {},
});

const envelopeErr = (message: string, code?: string) => ({
  success: false,
  message,
  code,
  meta: {},
});

const { server, listen, close, resetHandlers } = makeServer();

beforeAll(() => listen());
afterAll(() => close());
afterEach(() => {
  resetHandlers();
  resetAuthStore();
  authEvents.reset();
});

describe('api response envelope', () => {
  it('unwraps successful envelopes to data', async () => {
    server.use(
      http.get(`${BASE}/auth/me`, () =>
        HttpResponse.json(
          envelopeOk({
            id: '1',
            email: 'a@b.c',
            username: 'a',
            fullName: 'A',
            status: 'active',
            roles: ['admin'],
            permissions: ['customer.read'],
          }),
        ),
      ),
    );
    seedAuthStore({ accessToken: 'access1', refreshToken: 'refresh1' });
    const me = await authApi.me();
    expect(me.email).toBe('a@b.c');
    expect(me.permissions).toContain('customer.read');
  });

  it('rejects an error envelope as ApiClientError with status + code', async () => {
    server.use(
      http.post(`${BASE}/auth/login`, () =>
        HttpResponse.json(envelopeErr('Invalid credentials', 'AUTH_BAD'), {
          status: 401,
        }),
      ),
    );
    const promise = authApi.login({ usernameOrEmail: 'x', password: 'y' });
    await expect(promise).rejects.toBeInstanceOf(ApiClientError);
    try {
      await promise;
    } catch (e) {
      const err = e as ApiClientError;
      expect(err.status).toBe(401);
      expect(err.code).toBe('AUTH_BAD');
      expect(err.message).toBe('Invalid credentials');
    }
  });

  it('throws ApiClientError(0) for network failures', async () => {
    server.use(http.get(`${BASE}/auth/me`, () => HttpResponse.error()));
    seedAuthStore({ accessToken: 'access1', refreshToken: 'refresh1' });
    await expect(authApi.me()).rejects.toBeInstanceOf(ApiClientError);
  });
});

describe('request interceptor — Authorization header', () => {
  it('attaches Bearer <accessToken> from the store on every request', async () => {
    let observedAuth: string | null = null;
    server.use(
      http.get(`${BASE}/auth/me`, ({ request }) => {
        observedAuth = request.headers.get('authorization');
        return HttpResponse.json(
          envelopeOk({
            id: '1',
            email: 'a@b.c',
            username: 'a',
            fullName: 'A',
            status: 'active',
            roles: [],
            permissions: [],
          }),
        );
      }),
    );
    seedAuthStore({ accessToken: 'tok-abc', refreshToken: 'r1' });
    await authApi.me();
    expect(observedAuth).toBe('Bearer tok-abc');
  });

  it('omits Authorization header when no token in store', async () => {
    let observedAuth: string | null = null;
    server.use(
      http.post(`${BASE}/auth/login`, ({ request }) => {
        observedAuth = request.headers.get('authorization');
        return HttpResponse.json(
          envelopeOk({
            accessToken: 'a1',
            refreshToken: 'r1',
            tokenType: 'Bearer',
            expiresIn: 900,
            user: {
              id: '1',
              email: 'a@b.c',
              username: 'a',
              fullName: 'A',
              status: 'active',
              roles: [],
              permissions: [],
            },
          }),
        );
      }),
    );
    await authApi.login({ usernameOrEmail: 'a', password: 'b' });
    expect(observedAuth).toBeNull();
  });
});

describe('401 refresh flow', () => {
  it('retries the original request after a successful refresh', async () => {
    seedAuthStore({ accessToken: 'expired', refreshToken: 'refresh-ok' });

    let meCallCount = 0;
    server.use(
      http.get(`${BASE}/auth/me`, ({ request }) => {
        meCallCount += 1;
        const auth = request.headers.get('authorization');
        if (auth === 'Bearer expired') {
          return HttpResponse.json(envelopeErr('Unauthorized'), { status: 401 });
        }
        return HttpResponse.json(
          envelopeOk({
            id: '1',
            email: 'a@b.c',
            username: 'a',
            fullName: 'A',
            status: 'active',
            roles: [],
            permissions: [],
          }),
        );
      }),
      http.post(`${BASE}/auth/refresh`, () =>
        HttpResponse.json(
          envelopeOk({
            accessToken: 'fresh',
            refreshToken: 'refresh-rotated',
            tokenType: 'Bearer',
            expiresIn: 900,
          }),
        ),
      ),
    );

    const me = await authApi.me();
    expect(me.email).toBe('a@b.c');
    expect(meCallCount).toBe(2); // initial 401 + retry
    expect(useAuthStore.getState().accessToken).toBe('fresh');
    expect(useAuthStore.getState().refreshToken).toBe('refresh-rotated');
  });

  it('single-flights parallel refreshes: 5 concurrent 401s -> 1 refresh call', async () => {
    seedAuthStore({ accessToken: 'expired', refreshToken: 'r' });

    let refreshCount = 0;
    server.use(
      http.get(`${BASE}/auth/me`, ({ request }) => {
        const auth = request.headers.get('authorization');
        if (auth === 'Bearer expired') {
          return HttpResponse.json(envelopeErr('Unauthorized'), { status: 401 });
        }
        return HttpResponse.json(
          envelopeOk({
            id: '1',
            email: 'a@b.c',
            username: 'a',
            fullName: 'A',
            status: 'active',
            roles: [],
            permissions: [],
          }),
        );
      }),
      http.post(`${BASE}/auth/refresh`, async () => {
        refreshCount += 1;
        // Delay so all 5 401s pile up before we resolve.
        await new Promise((r) => setTimeout(r, 30));
        return HttpResponse.json(
          envelopeOk({
            accessToken: 'fresh',
            refreshToken: 'r2',
            tokenType: 'Bearer',
            expiresIn: 900,
          }),
        );
      }),
    );

    const results = await Promise.all([
      authApi.me(),
      authApi.me(),
      authApi.me(),
      authApi.me(),
      authApi.me(),
    ]);
    expect(results).toHaveLength(5);
    expect(refreshCount).toBe(1);
  });

  it('clears session and emits logout when refresh fails', async () => {
    seedAuthStore({ accessToken: 'expired', refreshToken: 'bad' });

    const onLogout = vi.fn();
    authEvents.on('logout', onLogout);

    server.use(
      http.get(`${BASE}/auth/me`, () =>
        HttpResponse.json(envelopeErr('Unauthorized'), { status: 401 }),
      ),
      http.post(`${BASE}/auth/refresh`, () =>
        HttpResponse.json(envelopeErr('Refresh token invalid'), { status: 401 }),
      ),
    );

    await expect(authApi.me()).rejects.toBeInstanceOf(ApiClientError);
    expect(onLogout).toHaveBeenCalledOnce();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('does NOT attempt refresh for /auth/login 401', async () => {
    let refreshCount = 0;
    server.use(
      http.post(`${BASE}/auth/login`, () =>
        HttpResponse.json(envelopeErr('Invalid credentials'), { status: 401 }),
      ),
      http.post(`${BASE}/auth/refresh`, () => {
        refreshCount += 1;
        return HttpResponse.json(envelopeOk({}), { status: 200 });
      }),
    );

    await expect(
      authApi.login({ usernameOrEmail: 'a', password: 'b' }),
    ).rejects.toBeInstanceOf(ApiClientError);
    expect(refreshCount).toBe(0);
  });

  it('does NOT attempt refresh when no refreshToken in store', async () => {
    // No seed -> store is empty
    let refreshCount = 0;
    server.use(
      http.get(`${BASE}/auth/me`, () =>
        HttpResponse.json(envelopeErr('Unauthorized'), { status: 401 }),
      ),
      http.post(`${BASE}/auth/refresh`, () => {
        refreshCount += 1;
        return HttpResponse.json(envelopeOk({}), { status: 200 });
      }),
    );

    await expect(authApi.me()).rejects.toBeInstanceOf(ApiClientError);
    expect(refreshCount).toBe(0);
  });
});

describe('auth store actions', () => {
  it('loginAndStore populates store after successful login', async () => {
    server.use(
      http.post(`${BASE}/auth/login`, () =>
        HttpResponse.json(
          envelopeOk({
            accessToken: 'access1',
            refreshToken: 'refresh1',
            tokenType: 'Bearer',
            expiresIn: 900,
            user: {
              id: '42',
              email: 'admin@unms.local',
              username: 'superadmin',
              fullName: 'Super Admin',
              status: 'active',
              roles: ['superadmin'],
              permissions: ['customer.read', 'customer.create'],
            },
          }),
        ),
      ),
    );

    const user = await useAuthStore
      .getState()
      .loginAndStore({ usernameOrEmail: 'admin@unms.local', password: 'admin123' });

    expect(user.email).toBe('admin@unms.local');
    expect(useAuthStore.getState().accessToken).toBe('access1');
    expect(useAuthStore.getState().refreshToken).toBe('refresh1');
    expect(useAuthStore.getState().hasAllPermissions(['customer.read'])).toBe(true);
    expect(useAuthStore.getState().hasAllPermissions(['nope.perm'])).toBe(false);
  });

  it('logout clears store even when backend call fails', async () => {
    seedAuthStore({ accessToken: 'a', refreshToken: 'r' });
    server.use(
      http.post(`${BASE}/auth/logout`, () =>
        HttpResponse.json(envelopeErr('Server error'), { status: 500 }),
      ),
    );

    await useAuthStore.getState().logout();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('hasAllPermissions selector', () => {
  it('returns false when user is null', () => {
    resetAuthStore();
    expect(useAuthStore.getState().hasAllPermissions(['x'])).toBe(false);
  });

  it('returns true only when all required perms are owned (AND semantics)', () => {
    seedAuthStore({ accessToken: 'a', refreshToken: 'r' });
    useAuthStore.setState({
      user: {
        id: '1',
        email: 'a@b.c',
        username: 'a',
        fullName: 'A',
        status: 'active',
        roles: ['admin'],
        permissions: ['customer.read', 'customer.create'],
      },
    });
    expect(
      useAuthStore.getState().hasAllPermissions(['customer.read', 'customer.create']),
    ).toBe(true);
    expect(useAuthStore.getState().hasAllPermissions(['customer.read'])).toBe(true);
    expect(
      useAuthStore.getState().hasAllPermissions(['customer.read', 'customer.delete']),
    ).toBe(false);
  });
});

describe('auth events bus', () => {
  it('emits to all subscribers and supports unsubscribe', () => {
    const a = vi.fn();
    const b = vi.fn();
    const offA = authEvents.on('logout', a);
    authEvents.on('logout', b);

    authEvents.emit('logout');
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();

    offA();
    authEvents.emit('logout');
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledTimes(2);
  });
});
