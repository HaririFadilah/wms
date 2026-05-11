import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import {
  CUSTOMER_CODE_COUNTER_KEY,
  CUSTOMER_CODE_MIN_COUNTER_DIGITS,
  CUSTOMER_CODE_PREFIX_SETTING_KEY,
  DEFAULT_CUSTOMER_CODE_PREFIX,
} from './customer-code.constants';

/**
 * Either a `PrismaService` or a `Prisma.TransactionClient` — both expose the same
 * model query interface plus `$queryRaw`. This lets `generateCustomerCode` be called
 * standalone OR within an outer transaction (e.g. `CustomerService.create` opens a
 * transaction that does both: lock counter + insert customer row).
 */
export type CustomerCodeTx = PrismaService | Prisma.TransactionClient;

/**
 * Generates the global UNMS customer code.
 *
 * Format:  `{PREFIX}{YY}{MM}{NNNN}`
 *   - PREFIX: from system_settings (`customer_code.prefix`), default `REG`
 *   - YY:     2-digit year of the time the code is generated (server timezone)
 *   - MM:     2-digit month
 *   - NNNN:   GLOBAL counter, zero-padded to {@link CUSTOMER_CODE_MIN_COUNTER_DIGITS}
 *
 * IMPORTANT: counter is GLOBAL and NEVER reset per month/year. This is by design
 * (the plan document forbids resetting). The counter is sourced atomically from
 * `system_counters.customer_global_sequence` using a row-level lock
 * (`SELECT ... FOR UPDATE`) inside a SERIALIZABLE transaction.
 */
@Injectable()
export class CustomerCodeService {
  private readonly logger = new Logger(CustomerCodeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate the next customer code.
   *
   * @param outerTx  Optional outer transaction client. If provided, the counter
   *                 is incremented inside that same transaction, atomically with
   *                 the caller's other writes (e.g. inserting a new customer row).
   * @returns The newly-allocated customer code (e.g. `REG2605000123`).
   */
  async generateCustomerCode(outerTx?: Prisma.TransactionClient): Promise<string> {
    if (outerTx) {
      return this.allocateOnTx(outerTx);
    }
    return this.prisma.runInTransaction((tx) => this.allocateOnTx(tx));
  }

  /**
   * Allocate a counter value and produce a code, ON the given transaction client.
   * Uses `SELECT ... FOR UPDATE` for the row lock. Caller must already hold a
   * transaction or this method will not be atomic against parallel callers.
   */
  private async allocateOnTx(tx: Prisma.TransactionClient): Promise<string> {
    // 1. Row-lock the counter
    const rows = await tx.$queryRaw<Array<{ current_value: bigint }>>`
      SELECT current_value FROM system_counters
      WHERE \`key\` = ${CUSTOMER_CODE_COUNTER_KEY}
      FOR UPDATE
    `;
    const current = rows[0]?.current_value;
    if (current === undefined) {
      // Counter row missing — should have been seeded in BE-0003. Recover by upserting.
      this.logger.warn(
        `Counter "${CUSTOMER_CODE_COUNTER_KEY}" was missing — seeding inline. (Did seed run?)`,
      );
      await tx.systemCounter.upsert({
        where: { key: CUSTOMER_CODE_COUNTER_KEY },
        create: { key: CUSTOMER_CODE_COUNTER_KEY, currentValue: 1n },
        update: {},
      });
      return this.formatCode(1n, await this.readPrefix(tx));
    }

    const next = current + 1n;

    // 2. Persist
    await tx.systemCounter.update({
      where: { key: CUSTOMER_CODE_COUNTER_KEY },
      data: { currentValue: next },
    });

    // 3. Format
    const prefix = await this.readPrefix(tx);
    return this.formatCode(next, prefix);
  }

  private async readPrefix(tx: Prisma.TransactionClient): Promise<string> {
    const row = await tx.systemSetting.findUnique({
      where: { key: CUSTOMER_CODE_PREFIX_SETTING_KEY },
      select: { value: true },
    });
    const prefix = row?.value?.trim();
    return prefix && prefix.length > 0 ? prefix : DEFAULT_CUSTOMER_CODE_PREFIX;
  }

  /**
   * Pure formatter. Exposed for unit testing.
   *
   * @param counter Current global counter value (must be >= 1).
   * @param prefix  Prefix (already resolved from settings).
   * @param now     (Optional) point-in-time. Defaults to `new Date()`. Useful for tests.
   */
  formatCode(counter: bigint, prefix: string, now: Date = new Date()): string {
    if (counter <= 0n) {
      throw new Error(`counter must be >= 1, got ${counter.toString()}`);
    }
    const yy = String(now.getFullYear() % 100).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const padded = counter.toString().padStart(CUSTOMER_CODE_MIN_COUNTER_DIGITS, '0');
    return `${prefix}${yy}${mm}${padded}`;
  }
}
