// Minimal pub/sub so the (non-React) axios interceptor can signal the React layer
// when the session is forcibly terminated (refresh failed / 401 on /me / etc).
// FE-0101 listens for 'logout' and redirects to /login.
//
// Why not just route directly here? The interceptor runs outside the React tree;
// `useRouter()` isn't available. A tiny event bus keeps things decoupled and
// trivially testable.

type AuthEvent = 'logout';
type Handler = () => void;

class AuthEventEmitter {
  private handlers = new Map<AuthEvent, Set<Handler>>();

  on(event: AuthEvent, handler: Handler): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler);
    return () => set.delete(handler);
  }

  emit(event: AuthEvent): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of set) {
      try {
        handler();
      } catch {
        // Swallow listener errors — they shouldn't break other listeners.
      }
    }
  }

  /** Test helper — clear ALL listeners. Not for production use. */
  reset(): void {
    this.handlers.clear();
  }
}

export const authEvents = new AuthEventEmitter();
