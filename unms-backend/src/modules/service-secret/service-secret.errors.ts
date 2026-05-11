/**
 * Thrown when ServiceSecretGenerator exhausts its retry budget without finding
 * a free `pppoe_username`. In practice this should never happen for a healthy
 * setup (32^4 ≈ 1M suffixes per customer), but the caller can catch this
 * specifically to surface a 503 / "try again later" to the UI.
 */
export class ServiceSecretCollisionError extends Error {
  constructor(
    public readonly customerCode: string,
    public readonly attempts: number,
  ) {
    super(
      `Failed to generate a unique service secret for customer "${customerCode}" after ${attempts} attempts. ` +
        `Consider widening service.secret.random_length in system_settings.`,
    );
    this.name = 'ServiceSecretCollisionError';
  }
}
