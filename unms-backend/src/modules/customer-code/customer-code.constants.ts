// Constants used by CustomerCodeService.
// Keep these here (not magic strings sprinkled across the codebase) so future tasks
// (BE-0102 ServiceSecretGenerator, BE-0301 CustomerService) can re-use them.

export const CUSTOMER_CODE_COUNTER_KEY = 'customer_global_sequence';
export const CUSTOMER_CODE_PREFIX_SETTING_KEY = 'customer_code.prefix';

/** Default prefix if `customer_code.prefix` setting is missing or blank. */
export const DEFAULT_CUSTOMER_CODE_PREFIX = 'REG';

/**
 * Minimum width of the numeric counter portion.
 * If counter > 9999 the code naturally widens (e.g. `REG260512345`); that is intentional —
 * we never recycle / reset, so eventually a 5th digit is expected.
 */
export const CUSTOMER_CODE_MIN_COUNTER_DIGITS = 4;
