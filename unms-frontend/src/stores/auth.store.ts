// Auth store (Zustand). Skeleton only — full login/refresh wiring lands in FE-0101.
// We persist tokens to localStorage so a refresh doesn't drop the session. Be aware
// localStorage isn't an XSS-proof vault; we'll revisit (httpOnly cookie + CSRF) when
// the backend supports it. For Sprint 1 demo this is acceptable.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '@/types/api';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** True once we've hydrated from storage (avoids SSR/initial-render flicker). */
  hasHydrated: boolean;

  setSession: (args: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
  clearSession: () => void;
  setHasHydrated: (v: boolean) => void;

  /** Convenience selector — does the user hold ALL listed permission codes? */
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
