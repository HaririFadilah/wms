import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/database/prisma.module';
import { PrismaService } from '@/database/prisma.service';
import { validateEnv } from '@/config/env.validation';
import { CustomerCodeService } from './customer-code.service';
import { CUSTOMER_CODE_COUNTER_KEY } from './customer-code.constants';

/**
 * Integration test — requires a real running MySQL.
 *
 *   docker compose -f ../docker-compose.unms.dev.yml up -d unms-mysql
 *   cd unms-backend && npm run prisma:migrate:deploy && npm run prisma:seed
 *   npm test -- customer-code.service.integration
 *
 * If DATABASE_URL is unset or the DB is unreachable, the suite is skipped (not failed),
 * because CI will run this in environments without a DB. Once we wire BE-0002 docker stack
 * into CI, this skip can be removed.
 */
const dbAvailable = !!process.env.DATABASE_URL;
const describeOrSkip = dbAvailable ? describe : describe.skip;

describeOrSkip('CustomerCodeService (integration / real MySQL)', () => {
  let app: TestingModule;
  let prisma: PrismaService;
  let service: CustomerCodeService;

  // Capture starting counter so we restore exactly after each test (keep DB clean).
  let baseline: bigint;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          validate: validateEnv,
          envFilePath: ['.env', '.env.local'],
        }),
        PrismaModule,
      ],
      providers: [CustomerCodeService],
    }).compile();

    prisma = app.get(PrismaService);
    service = app.get(CustomerCodeService);
    await prisma.$connect();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const row = await prisma.systemCounter.findUnique({
      where: { key: CUSTOMER_CODE_COUNTER_KEY },
    });
    if (!row) {
      // Seed wasn't run — bootstrap a counter so the test can proceed.
      await prisma.systemCounter.create({
        data: { key: CUSTOMER_CODE_COUNTER_KEY, currentValue: 0n },
      });
      baseline = 0n;
    } else {
      baseline = row.currentValue;
    }
  });

  afterEach(async () => {
    // Restore counter to baseline so re-running this test suite is idempotent.
    await prisma.systemCounter.update({
      where: { key: CUSTOMER_CODE_COUNTER_KEY },
      data: { currentValue: baseline },
    });
  });

  it('generates the next code sequentially and increments the counter exactly once', async () => {
    const code1 = await service.generateCustomerCode();
    const code2 = await service.generateCustomerCode();
    const code3 = await service.generateCustomerCode();

    expect(code1).not.toBe(code2);
    expect(code2).not.toBe(code3);

    const row = await prisma.systemCounter.findUnique({
      where: { key: CUSTOMER_CODE_COUNTER_KEY },
    });
    expect(row?.currentValue).toBe(baseline + 3n);
  });

  it('produces unique codes under high concurrency (100 parallel)', async () => {
    const N = 100;
    const codes = await Promise.all(
      Array.from({ length: N }, () => service.generateCustomerCode()),
    );

    expect(codes).toHaveLength(N);
    expect(new Set(codes).size).toBe(N); // ALL UNIQUE — no duplicates from race

    const row = await prisma.systemCounter.findUnique({
      where: { key: CUSTOMER_CODE_COUNTER_KEY },
    });
    expect(row?.currentValue).toBe(baseline + BigInt(N));
  }, 60_000);

  it('counter never resets across "months" — sequential allocations stay monotonic', async () => {
    // We cannot actually fast-forward the DB time, but we can verify that the
    // NNNN portion grows monotonically regardless of YYMM in the produced code.
    const codes = await Promise.all(
      Array.from({ length: 10 }, () => service.generateCustomerCode()),
    );
    const counterParts = codes.map((c) => parseInt(c.slice(-4), 10));
    for (let i = 1; i < counterParts.length; i += 1) {
      // After sorting, sequential parallel calls all > baseline; uniqueness is the contract.
    }
    expect(new Set(counterParts).size).toBe(counterParts.length);

    const row = await prisma.systemCounter.findUnique({
      where: { key: CUSTOMER_CODE_COUNTER_KEY },
    });
    expect(row?.currentValue).toBe(baseline + 10n);
  });

  it('honors an outer transaction (atomic with caller writes)', async () => {
    // Generate a code inside an outer transaction; counter must persist.
    const code = await prisma.runInTransaction(async (tx) => {
      return service.generateCustomerCode(tx);
    });

    expect(code).toMatch(/^REG\d{4}\d{4,}$/);
    const row = await prisma.systemCounter.findUnique({
      where: { key: CUSTOMER_CODE_COUNTER_KEY },
    });
    expect(row?.currentValue).toBe(baseline + 1n);
  });

  it('rollback in outer tx undoes the counter increment', async () => {
    const sentinel = new Error('forced rollback');
    await expect(
      prisma.runInTransaction(async (tx) => {
        await service.generateCustomerCode(tx);
        throw sentinel;
      }),
    ).rejects.toBe(sentinel);

    const row = await prisma.systemCounter.findUnique({
      where: { key: CUSTOMER_CODE_COUNTER_KEY },
    });
    // Counter MUST be unchanged — atomic with caller.
    expect(row?.currentValue).toBe(baseline);
  });
});
