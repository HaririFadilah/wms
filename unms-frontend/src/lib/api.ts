// Axios instance + envelope unwrap. The full token-attach + 401-refresh logic
// lands in FE-0002; here we just set the baseURL + a response interceptor that
// peels the { success, data, meta } envelope so callers receive plain `T`.

import axios, { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import type { ApiError, ApiResponse } from '@/types/api';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Lightweight error class so we can `instanceof ApiClientError` upstream.
 * Stores the HTTP status and any structured `errors` payload (e.g. field errors).
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

api.interceptors.response.use(
  (res: AxiosResponse<ApiResponse<unknown>>) => {
    const body = res.data;
    if (body && typeof body === 'object' && 'success' in body) {
      if (body.success) {
        // Replace the data field on the AxiosResponse so callers can do
        // `const { data } = await api.get(...)` and get the unwrapped payload.
        return { ...res, data: body.data };
      }
      throw new ApiClientError(res.status, body.message, body.code, body.errors);
    }
    return res;
  },
  (err: AxiosError<ApiError>) => {
    const status = err.response?.status ?? 0;
    const body = err.response?.data;
    if (body && typeof body === 'object' && 'message' in body) {
      throw new ApiClientError(status, body.message, body.code, body.errors);
    }
    throw new ApiClientError(status, err.message || 'Network error');
  },
);

/**
 * Helper to attach Authorization header without modifying the singleton instance.
 * FE-0002 will replace this with a request interceptor that reads from the auth store.
 */
export function withAuthHeader(token: string | null): AxiosHeaders {
  const headers = new AxiosHeaders();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}
