import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/database/prisma.module';
import { PrismaService } from '@/database/prisma.service';
import { validateEnv } from '@/config/env.validation';
import { ServiceSecretGenerator } from './service-secret.generator';
import { ServiceSecretCollisionError } from './service-secret.errors';

const dbAvailable = !!process.env.DATABASE_URL;
const describeOrSkip = dbAvailable ? describe : describe.skip;

/**
 * Integration tests for ServiceSecretGenerator. Requires a running MySQL with
 * the BE-0004 schema applied (`services` + `radcheck` tables). The tests insert
 * temporary rows into `radcheck` (cheap — no FK to other tables) to simulate
 * collisions, then clean up.
 */
describeOrSkip('ServiceSecretGenerator (integration / real MySQL)', () => {
  let app: TestingModule;
  let prisma: PrismaService;
  let generator: ServiceSecretGenerator;

  // Track what we add so afterEach can clean up regardless of test outcome.
  const cleanupUsernames = new Set<string>();

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
      providers: [ServiceSecretGenerator],
    }).compile();

    prisma = app.get(PrismaService);
    generator = app.get(ServiceSecretGenerator);
    await prisma.$connect();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    if (cleanupUsernames.size > 0) {
      await prisma.radCheck.deleteMany({
        where: { username: { in: [...cleanupUsernames] } },
      });
      cleanupUsernames.clear();
    }
  });

  it('produces a username with the expected shape against an empty DB', async () => {
    const username = await generator.generateUsername('REGTEST0001');
    expect(username).toMatch(/^REGTEST0001_[a-z2-9]{4}$/);
  });

  it('avoids colliding with an existing radcheck row', async () => {
    // Seed a radcheck row that would collide if we picked a specific suffix.
    // We can't predict the suffix, so we test the inverse: pre-fill many
    // *unrelated* suffixes for the same customer and assert generator still works.
    const customer = `REGTEST${Date.now() % 10000}`;
    const samples = ['_aaaa', '_bbbb', '_cccc', '_dddd', '_eeee'];
    for (const s of samples) {
      const u = `${customer}${s}`;
      cleanupUsernames.add(u);
      await prisma.radCheck.create({
        data: {
          username: u,
          attribute: 'Cleartext-Password',
          op: ':=',
          value: 'seed-for-test',
        },
      });
    }

    const username = await generator.generateUsername(customer);
    expect(username).toMatch(new RegExp(`^${customer}_[a-z2-9]{4}$`));
    // It MUST NOT be any of the seeded ones
    for (const s of samples) {
      expect(username).not.toBe(`${customer}${s}`);
    }
  });

  it('returns unique usernames under high concurrency (50 parallel for same customer)', async () => {
    const customer = `REGCONC${Date.now() % 10000}`;
    const N = 50;
    const usernames = await Promise.all(
      Array.from({ length: N }, () => generator.generateUsername(customer)),
    );

    expect(usernames).toHaveLength(N);
    // All have the expected shape
    for (const u of usernames) {
      expect(u).toMatch(new RegExp(`^${customer}_[a-z2-9]{4}$`));
    }

    // Note: because we DON'T insert into services here, "unique" here is
    // probabilistic on the random suffix alone. With 32^4 ≈ 1M combos vs N=50,
    // we should get all-unique nearly 100% of the time. If this becomes flaky,
    // either raise random_length or insert into services/radcheck between calls.
    expect(new Set(usernames).size).toBe(N);
  }, 60_000);

  it('throws ServiceSecretCollisionError when retry budget exhausted', async () => {
    // Force exhaustion by:
    //   1. Using a 2-char random length (32^2 = 1024 combos)
    //   2. Pre-filling ALL 1024 combos in radcheck for a unique customer prefix
    const customer = `REGEX${Date.now() % 100000}`;
    const charset = 'abcdefghjkmnpqrstuvwxyz23456789';

    const inserts: Array<{ username: string }> = [];
    for (const a of charset) {
      for (const b of charset) {
        inserts.push({ username: `${customer}_${a}${b}` });
      }
    }
    // Bulk insert
    await prisma.radCheck.createMany({
      data: inserts.map(({ username }) => ({
        username,
        attribute: 'Cleartext-Password',
        op: ':=',
        value: 'force-collision',
      })),
    });
    inserts.forEach((i) => cleanupUsernames.add(i.username));

    await expect(
      generator.generateUsername(customer, { randomLength: 2, maxRetries: 5 }),
    ).rejects.toBeInstanceOf(ServiceSecretCollisionError);
  }, 60_000);

  it('honors outerTx: rollback discards no DB state (generator is read-only)', async () => {
    // The generator only READS from DB; we just verify it still works in an outer tx.
    const customer = `REGTX${Date.now() % 10000}`;
    const username = await prisma.runInTransaction(async (tx) => {
      return generator.generateUsername(customer, {}, tx);
    });
    expect(username).toMatch(new RegExp(`^${customer}_[a-z2-9]{4}$`));
  });
});
