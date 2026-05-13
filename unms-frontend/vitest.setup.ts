import '@testing-library/jest-dom/vitest';

// jsdom doesn't ship Web Crypto out of the box (some libs need it).
import { webcrypto } from 'node:crypto';
if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto });
}

// MSW v2 in Node requires `Response`, `Request`, `Headers`. jsdom now ships them
// in recent versions, but assert anyway so we fail loud if missing.
if (typeof Response === 'undefined') {
  throw new Error('Global fetch primitives missing — check Node version');
}
