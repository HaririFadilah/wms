import { randomInt } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import {
  DEFAULT_MAX_RETRIES,
  DEFAULT_PASSWORD_LENGTH,
  DEFAULT_RANDOM_LENGTH,
  PASSWORD_CHARSET,
  SERVICE_SECRET_RANDOM_LENGTH_SETTING_KEY,
  USERNAME_CHARSET,
  USERNAME_SEPARATOR,
} from './service-secret.constants';
import { ServiceSecretCollisionError } from './service-secret.errors';

export type ServiceSecretTx = PrismaService | Prisma.TransactionClient;

export interface GeneratedServiceSecret {
  /** PPPoE/Radius username — guaranteed unique across `services` + `radcheck` at generation time. */
  username: string;
  /** Random plaintext password. Caller MUST hash before storing in `services.pppoePasswordHash`. */
  password: string;
}

export interface GenerateUsernameOptions {
  /** Override random suffix length (default: from `system_settings`, fallback 4). */
  randomLength?: number;
  /** Override max collision retries (default 8). */
  maxRetries?: number;
}

export interface GenerateOptions extends GenerateUsernameOptions {
  /** Override password length (default 12). */
  passwordLength?: number;
}

/**
 * Generates the **service secret** (PPPoE/Radius username + password) used by every
 * service row in UNMS.
 *
 * Username format: `{customerCode}{SEP}{randomN}`  → e.g. `REG26050001_a3b7`
 *   - SEP is `_`
 *   - random suffix uses {@link USERNAME_CHARSET} (lowercase + digits, no confusables)
 *   - The combination is globally unique across `services.pppoe_username` AND
 *     `radcheck.username` (FreeRadius standard table) — so both provisioning modes
 *     (API vs Radius) share one namespace and can never collide.
 *
 * Password: random plaintext, {@link PASSWORD_CHARSET}, default length 12. Returned
 * **in clear** so the caller can:
 *   1. hash with bcrypt → store in `services.pppoePasswordHash`
 *   2. push the cleartext to MikroTik (API mode) or `radcheck` (Radius mode)
 *
 * Concurrency model:
 *   - We CHECK uniqueness with two SELECT queries, then return. Caller is responsible
 *     for inserting in a transaction. If two callers happen to pick the same suffix
 *     between our check and their INSERT, the UNIQUE constraint on
 *     `services.pppoe_username` will trip — caller catches that and retries.
 *   - Birthday-collision probability for 4 chars from 32-char alphabet is ~1e-6 per
 *     parallel pair, so even at 50 parallel inserts for the same customer the chance
 *     of needing retry is sub-percent. For larger fleets, bump
 *     `service.secret.random_length` in system_settings.
 */
@Injectable()
export class ServiceSecretGenerator {
  private readonly logger = new Logger(ServiceSecretGenerator.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Generate username + password as a single bundle. */
  async generate(
    customerCode: string,
    options: GenerateOptions = {},
    outerTx?: Prisma.TransactionClient,
  ): Promise<GeneratedServiceSecret> {
    const username = await this.generateUsername(customerCode, options, outerTx);
    const password = this.generatePassword(options.passwordLength ?? DEFAULT_PASSWORD_LENGTH);
    return { username, password };
  }

  /**
   * Generate a unique PPPoE/Radius username for `customerCode`. Retries on collision.
   *
   * @throws {@link ServiceSecretCollisionError} when retry budget is exhausted.
   */
  async generateUsername(
    customerCode: string,
    options: GenerateUsernameOptions = {},
    outerTx?: Prisma.TransactionClient,
  ): Promise<string> {
    if (!customerCode || customerCode.trim().length === 0) {
      throw new Error('customerCode is required');
    }

    const tx: ServiceSecretTx = outerTx ?? this.prisma;
    const randomLength = options.randomLength ?? (await this.readRandomLength(tx));
    const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      const candidate = this.composeUsername(customerCode, randomLength);
      const taken = await this.isTaken(tx, candidate);
      if (!taken) {
        if (attempt > 1) {
          this.logger.warn(
            `ServiceSecretGenerator: collision recovered for customer=${customerCode} on attempt ${attempt}`,
          );
        }
        return candidate;
      }
    }

    throw new ServiceSecretCollisionError(customerCode, maxRetries);
  }

  /**
   * Generate a cryptographically-strong random password.
   * Pure — does not touch the DB. Exposed for unit tests.
   */
  generatePassword(length: number = DEFAULT_PASSWORD_LENGTH): string {
    if (length < 6) {
      throw new Error(`password length must be >= 6, got ${length}`);
    }
    return this.randomFromCharset(PASSWORD_CHARSET, length);
  }

  /**
   * Compose a candidate username = customerCode + "_" + random suffix.
   * Pure — exposed for unit tests.
   */
  composeUsername(customerCode: string, randomLength: number = DEFAULT_RANDOM_LENGTH): string {
    if (randomLength < 2) {
      throw new Error(`randomLength must be >= 2, got ${randomLength}`);
    }
    const suffix = this.randomFromCharset(USERNAME_CHARSET, randomLength);
    return `${customerCode}${USERNAME_SEPARATOR}${suffix}`;
  }

  // ---- internal helpers ----

  private async readRandomLength(tx: ServiceSecretTx): Promise<number> {
    const row = await tx.systemSetting.findUnique({
      where: { key: SERVICE_SECRET_RANDOM_LENGTH_SETTING_KEY },
      select: { value: true },
    });
    const raw = row?.value?.trim();
    if (!raw) {
      return DEFAULT_RANDOM_LENGTH;
    }
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed < 2) {
      this.logger.warn(
        `system_settings.${SERVICE_SECRET_RANDOM_LENGTH_SETTING_KEY}="${raw}" is invalid; falling back to ${DEFAULT_RANDOM_LENGTH}`,
      );
      return DEFAULT_RANDOM_LENGTH;
    }
    return parsed;
  }

  /**
   * Returns true if the candidate username is already in use, either as a
   * `services.pppoe_username` or as a `radcheck.username` (Radius mode).
   */
  private async isTaken(tx: ServiceSecretTx, username: string): Promise<boolean> {
    const [svc, rad] = await Promise.all([
      tx.service.findUnique({
        where: { pppoeUsername: username },
        select: { id: true },
      }),
      // radcheck.username is NOT unique by FreeRadius default (multiple AVPs per user),
      // so we just check existence.
      tx.radCheck.findFirst({
        where: { username },
        select: { id: true },
      }),
    ]);
    return svc !== null || rad !== null;
  }

  /** Crypto-secure random pick over a charset. */
  private randomFromCharset(charset: string, length: number): string {
    if (charset.length === 0) {
      throw new Error('charset must not be empty');
    }
    let out = '';
    for (let i = 0; i < length; i += 1) {
      out += charset[randomInt(0, charset.length)];
    }
    return out;
  }
}
