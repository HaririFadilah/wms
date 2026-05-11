// Jest setup — global hooks / matchers.
// Keep this thin; per-suite setup lives next to the test.

// Make BigInt serializable in error/assertion messages (Jest prints these).
// Without this, `expect(...).toBe(1n)` produces "TypeError: Do not know how to serialize a BigInt".
declare global {
  interface BigInt {
    toJSON(): string;
  }
}
BigInt.prototype.toJSON = function toJSON(): string {
  return this.toString();
};

export {};
