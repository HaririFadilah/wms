// Test-only helpers to reset the persisted Zustand auth store between tests.
// We deliberately import the store from the same path as production code so we
// exercise the real persist middleware + selectors.

import { useAuthStore } from '@/stores/auth.store';

export function resetAuthStore(): void {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    hasHydrated: true,
  });
  // Also clear localStorage so persist doesn't repopulate on next render.
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('unms-auth');
  }
}

export function seedAuthStore(args: {
  accessToken: string;
  refreshToken: string;
  userId?: string;
}): void {
  useAuthStore.setState({
    user: {
      id: args.userId ?? '1',
      email: 'tester@unms.local',
      username: 'tester',
      fullName: 'Tester',
      status: 'active',
      roles: ['admin'],
      permissions: ['customer.read'],
    },
    accessToken: args.accessToken,
    refreshToken: args.refreshToken,
    hasHydrated: true,
  });
}
