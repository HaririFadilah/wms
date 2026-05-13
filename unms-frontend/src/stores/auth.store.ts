// Auth store (Zustand). Persists user + tokens to localStorage so a hard refresh
// doesn't drop the session. Tokens in localStorage are NOT XSS-proof; we'll
// revisit (httpOnly cookie + CSRF) when the backend supports it.
//
// Actions:
// - loginAndStore: call POST /auth/login + populate store
// - logout: best-effort POST /auth/logout + clear store
// - clearSession: synchronous local-only clear (used by interceptor)
// - setSession: low-level setter (also used by interceptor on /refresh success)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '@/types/api';
import { authApi, type LoginInput } from '@/lib/api-routes';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** True once the store has hydrated from storage (avoids SSR/initial flicker). */
  hasHydrated: boolean;

  setSession: (args: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
  clearSession: () => void;
  setHasHydrated: (v: boolean) => void;

  loginAndStore: (input: LoginInput) => Promise<AuthUser>;
  logout: () => Promise<void>;

  hasAllPermissions: (codes: readonly string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,

      setSession: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken }),

      clearSession: () => set({ user: null, accessToken: null, refreshToken: null }),

      setHasHydrated: (v) => set({ hasHydrated: v }),

      loginAndStore: async (input) => {
        const res = await authApi.login(input);
        set({
          user: res.user,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        });
        return res.user;
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Best-effort — network/auth errors must NOT block local cleanup.
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      hasAllPermissions: (codes) => {
        const perms = get().user?.permissions;
        if (!perms || perms.length === 0) return false;
        const owned = new Set(perms);
        return codes.every((c) => owned.has(c));
      },
    }),
    {
      name: 'unms-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
