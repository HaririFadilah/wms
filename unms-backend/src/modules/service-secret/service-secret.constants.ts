// Constants used by ServiceSecretGenerator.

export const SERVICE_SECRET_RANDOM_LENGTH_SETTING_KEY = 'service.secret.random_length';

/** Default random suffix length when setting is missing or invalid. */
export const DEFAULT_RANDOM_LENGTH = 4;

/** Maximum collision retries before throwing. */
export const DEFAULT_MAX_RETRIES = 8;

/** Default password length (caller can override). */
export const DEFAULT_PASSWORD_LENGTH = 12;

/**
 * Charset for the username random suffix: lowercase + digits, MINUS confusables.
 * (Excluded: 0/o, 1/l/i — humans copy these wrong, support cost is high.)
 * 32 chars → 32^4 ≈ 1M unique suffixes per customer.
 */
export const USERNAME_CHARSET = 'abcdefghjkmnpqrstuvwxyz23456789';

/**
 * Charset for the random password (stronger): upper+lower+digit, minus confusables.
 * Excluded: 0/o/O, 1/l/I/L (look-alike in common fonts).
 * 54 chars → 54^12 ≈ 4.6·10^20 combos for default 12-char length.
 */
export const PASSWORD_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

/** Separator between customer_code and random suffix. */
export const USERNAME_SEPARATOR = '_';
