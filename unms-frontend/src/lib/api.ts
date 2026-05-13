// Axios singleton with:
// 1. Request interceptor that auto-attaches Bearer token from the auth store.
// 2. Response interceptor that unwraps the { success, message, data, meta } envelope.
// 3. Single-flight refresh-on-401: parallel requests share one /auth/refresh call.
//
// The token-refresh logic deliberately reads the auth store imperatively
// (`useAuthStore.getState()`) so the interceptor doesn't need to live inside a
// React tree. When refresh fails, we clear the session and emit an 'logout'
// event that the FE-0101 layout listens to (router.replace('/login')).

import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError, ApiResponse, TokenPair } from '@/types/api';
import { useAuthStore } from '@/stores/auth.store';
import { authEvents } from '@/lib/auth-events';

const DEFAULT_BASE_URL = 'http://localhost:3001/api/v1';
const baseURL = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_BASE_URL;

/** Paths (relative to `baseURL`) that must NOT trigger the refresh dance. */
const REFRESH_BLACKLIST = ['/auth/login', '/auth/refresh', '/auth/logout'];

export const api = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

/** Marker attached to a retried request so we don't loop on persistent 401s. */
interface RetriedRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Lightweight error class with the HTTP status and any structured `errors`
 * payload (e.g. validation field errors from the backend).
 */
export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly errors?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

// -----------------------------------------------------------------------------
// Request interceptor — attach Authorization header
// -----------------------------------------------------------------------------
api.interceptors.request.use((cfg) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    cfg.headers = cfg.headers ?? new AxiosHeaders();
    cfg.headers.set('Authorization', `Bearer ${token}`);
  }
  return cfg;
});

// -----------------------------------------------------------------------------
// Response interceptor — unwrap envelope + refresh-on-401
// -----------------------------------------------------------------------------

/**
 * Single-flight refresh: while one refresh is in progress, ALL other 401-driven
 * refresh attempts await the same promise. Prevents N parallel POST /refresh
 * calls from a page that loads N queries simultaneously.
 */
let inFlightRefresh: Promise<string> | null = null;

async function refreshTokensOnce(): Promise<string> {
  if (inFlightRefresh) return inFlightRefresh;

  inFlightRefresh = (async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      throw new ApiClientError(401, 'No refresh token available', 'NO_REFRESH_TOKEN');
    }

    // Use a bare axios call (NOT the `api` instance) so we don't recurse through
    // our own interceptors / re-attach the dead access token.
    const res = await axios.post<ApiResponse<TokenPair>>(
      `${baseURL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15_000 },
    );

    const body = res.data;
    if (!body || !('success' in body) || !body.success) {
      const errBody = body as ApiError | undefined;
      throw new ApiClientError(
        res.status || 401,
        errBody?.message ?? 'Refresh failed',
        errBody?.code,
      );
    }

    const pair = body.data;
    const current = useAuthStore.getState();
    useAuthStore.setState({
      ...current,
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
    });
    return pair.accessToken;
  })();

  try {
    return await inFlightRefresh;
  } finally {
    inFlightRefresh = null;
  }
}

function isBlacklistedForRefresh(url: string | undefined): boolean {
  if (!url) return false;
  return REFRESH_BLACKLIST.some((p) => url.endsWith(p) || url.includes(`${p}?`));
}

api.interceptors.response.use(
  (res: AxiosResponse<ApiResponse<unknown>>) => {
    const body = res.data;
    if (body && typeof body === 'object' && 'success' in body) {
      if (body.success) {
        return { ...res, data: body.data };
      }
      throw new ApiClientError(res.status, body.message, body.code, body.errors);
    }
    return res;
  },
  async (err: AxiosError<ApiError>) => {
    const status = err.response?.status ?? 0;
    const original = err.config as RetriedRequest | undefined;
    const body = err.response?.data;

    // Refresh-on-401: only attempt once, only when we have a refresh token, and
    // only if the failing request is not itself part of the auth flow.
    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isBlacklistedForRefresh(original.url) &&
      useAuthStore.getState().refreshToken
    ) {
      original._retry = true;
      try {
        const newAccess = await refreshTokensOnce();
        original.headers = original.headers ?? new AxiosHeaders();
        const headers =
          original.headers instanceof AxiosHeaders
            ? original.headers
            : new AxiosHeaders(original.headers);
        headers.set('Authorization', `Bearer ${newAccess}`);
        original.headers = headers;
        return api.request(original);
      } catch (refreshErr) {
        useAuthStore.getState().clearSession();
        authEvents.emit('logout');
        if (refreshErr instanceof ApiClientError) throw refreshErr;
        throw new ApiClientError(401, 'Session expired', 'AUTH_LOGOUT');
      }
    }

    if (body && typeof body === 'object' && 'message' in body) {
      throw new ApiClientError(status, body.message, body.code, body.errors);
    }
    throw new ApiClientError(status, err.message || 'Network error');
  },
);

/**
 * Type-safe request helper. Use this in hooks (`useQuery`, `useMutation`) so the
 * return type is the unwrapped payload `T`, not `AxiosResponse<T>`.
 */
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await api.request<T, AxiosResponse<T>>(config);
  return res.data;
}
