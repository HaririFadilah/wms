import { Test, type TestingModule } from '@nestjs/testing';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { CustomerCodeService } from './customer-code.service';
import { CUSTOMER_CODE_PREFIX_SETTING_KEY } from './customer-code.constants';

/**
 * Minimal shape of Prisma.TransactionClient used by CustomerCodeService.
 * Keeps the mock type-safe without dragging the whole TransactionClient surface.
 */
type MockTx = {
  $queryRaw: jest.Mock;
  systemCounter: {
    update: jest.Mock;
    upsert: jest.Mock;
  };
  systemSetting: {
    findUnique: jest.Mock;
  };
};

const asTx = (m: MockTx): Prisma.TransactionClient => m as unknown as Prisma.TransactionClient;

/**
 * Unit tests for CustomerCodeService:
 *   - pure formatter (`formatCode`)
 *   - `allocateOnTx` happy path with a mocked Prisma.TransactionClient
 *   - prefix resolution from system_settings
 *   - missing counter row (recovery path)
 *
 * Concurrency tests live in the integration spec file (needs a real MySQL).
 */
describe('CustomerCodeService (unit)', () => {
  let service: CustomerCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerCodeService,
        {
          provide: PrismaService,
          useValue: {
            // Not used in unit tests — we drive allocateOnTx via mocked tx
            runInTransaction: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get(CustomerCodeService);
  });

  describe('formatCode', () => {
    it('formats with prefix, YYMM, and 4-digit zero-padded counter', () => {
      const fixedDate = new Date('2026-05-11T10:00:00Z');
      expect(service.formatCode(1n, 'REG', fixedDate)).toBe('REG2605' + '0001');
      expect(service.formatCode(42n, 'REG', fixedDate)).toBe('REG2605' + '0042');
      expect(service.formatCode(9999n, 'REG', fixedDate)).toBe('REG2605' + '9999');
    });

    it('widens beyond 4 digits when counter exceeds 9999 (intentional, no recycle)', () => {
      const fixedDate = new Date('2026-05-11T10:00:00Z');
      expect(service.formatCode(10000n, 'REG', fixedDate)).toBe('REG260510000');
      expect(service.formatCode(123456n, 'REG', fixedDate)).toBe('REG2605123456');
    });

    it('respects an arbitrary prefix', () => {
      const fixedDate = new Date('2026-01-02T10:00:00Z');
      expect(service.formatCode(7n, 'PT', fixedDate)).toBe('PT2601' + '0007');
    });

    it('throws when counter <= 0', () => {
      expect(() => service.formatCode(0n, 'REG')).toThrow(/counter must be >= 1/);
      expect(() => service.formatCode(-5n, 'REG')).toThrow(/counter must be >= 1/);
    });

    it('uses current year/month when no date passed', () => {
      const code = service.formatCode(1n, 'REG');
      const now = new Date();
      const yy = String(now.getFullYear() % 100).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      expect(code).toBe(`REG${yy}${mm}0001`);
    });
  });

  describe('allocateOnTx (mocked tx)', () => {
    const mockTx = (counterValue: bigint | null, prefix = 'REG'): MockTx => ({
      $queryRaw: jest
        .fn()
        .mockResolvedValue(counterValue === null ? [] : [{ current_value: counterValue }]),
      systemCounter: {
        update: jest.fn().mockResolvedValue({}),
        upsert: jest.fn().mockResolvedValue({}),
      },
      systemSetting: {
        findUnique: jest.fn().mockResolvedValue({ value: prefix }),
      },
    });

    it('reads the locked counter, increments, persists, and returns formatted code', async () => {
      const tx = mockTx(41n, 'REG');
      const code = await service.generateCustomerCode(asTx(tx));

      expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
      expect(tx.systemCounter.update).toHaveBeenCalledWith({
        where: { key: 'customer_global_sequence' },
        data: { currentValue: 42n },
      });
      // 42n → padded "0042"
      expect(code).toMatch(/^REG\d{4}0042$/);
    });

    it('falls back to default prefix when system_settings.customer_code.prefix is missing', async () => {
      const tx = mockTx(0n);
      tx.systemSetting.findUnique = jest.fn().mockResolvedValue(null);
      const code = await service.generateCustomerCode(asTx(tx));
      expect(code).toMatch(/^REG/);
      expect(tx.systemSetting.findUnique).toHaveBeenCalledWith({
        where: { key: CUSTOMER_CODE_PREFIX_SETTING_KEY },
        select: { value: true },
      });
    });

    it('falls back to default prefix when setting value is blank', async () => {
      const tx = mockTx(0n);
      tx.systemSetting.findUnique = jest.fn().mockResolvedValue({ value: '   ' });
      const code = await service.generateCustomerCode(asTx(tx));
      expect(code).toMatch(/^REG/);
    });

    it('honors a custom prefix from settings', async () => {
      const tx = mockTx(7n, 'PT');
      const code = await service.generateCustomerCode(asTx(tx));
      expect(code).toMatch(/^PT\d{4}0008$/);
    });

    it('recovers when counter row is missing (returns 1)', async () => {
      const tx = mockTx(null);
      const code = await service.generateCustomerCode(asTx(tx));
      expect(tx.systemCounter.upsert).toHaveBeenCalled();
      expect(code).toMatch(/^REG\d{4}0001$/);
    });
  });
});
