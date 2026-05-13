// Typed thin wrappers around `apiRequest`. Each endpoint here returns the
// UNWRAPPED payload (the envelope is already peeled by the response
// interceptor). Keep this file pure data-layer: no React, no toasts, no
// routing — those concerns belong to hooks or the auth store.

import { apiRequest } from '@/lib/api';
import type { AuthUser, LoginResponse, TokenPair } from '@/types/api';

export interface LoginInput {
  usernameOrEmail: string;
  password: string;
}

export const authApi = {
  login: (input: LoginInput): Promise<LoginResponse> =>
    apiRequest<LoginResponse>({
      method: 'POST',
      url: '/auth/login',
      data: input,
    }),

  /**
   * Used internally by the axios interceptor (via `api.ts:refreshTokensOnce`)
   * and exposed here for explicit refresh flows / tests.
   */
  refresh: (refreshToken: string): Promise<TokenPair> =>
    apiRequest<TokenPair>({
      method: 'POST',
      url: '/auth/refresh',
      data: { refreshToken },
    }),

  me: (): Promise<AuthUser> =>
    apiRequest<AuthUser>({
      method: 'GET',
      url: '/auth/me',
    }),

  /**
   * Best-effort logout. The backend in BE-0201 has a no-op endpoint (server-side
   * revocation lands in BE-0202); calling it anyway lets us upgrade transparently.
   */
  logout: (): Promise<void> =>
    apiRequest<void>({
      method: 'POST',
      url: '/auth/logout',
    }),
};
