// Test-only HTTP mock server using MSW v2. Each test file creates its own
// `setupServer(...)` from this helper to keep handlers isolated. We default
// to onUnhandledRequest='error' so any unmocked call is loud.

import { setupServer } from 'msw/node';
import type { RequestHandler } from 'msw';

export function makeServer(...handlers: RequestHandler[]) {
  const server = setupServer(...handlers);
  return {
    server,
    listen: () => server.listen({ onUnhandledRequest: 'error' }),
    close: () => server.close(),
    resetHandlers: () => server.resetHandlers(),
  };
}
