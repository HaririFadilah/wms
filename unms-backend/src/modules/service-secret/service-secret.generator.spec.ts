import { Test, type TestingModule } from '@nestjs/testing';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { ServiceSecretGenerator } from './service-secret.generator';
import { ServiceSecretCollisionError } from './service-secret.errors';
import { PASSWORD_CHARSET, USERNAME_CHARSET, USERNAME_SEPARATOR } from './service-secret.constants';

type MockTx = {
  service: { findUnique: jest.Mock };
  radCheck: { findFirst: jest.Mock };
  systemSetting: { findUnique: jest.Mock };
};

const asTx = (m: MockTx): Prisma.TransactionClient => m as unknown as Prisma.TransactionClient;

const makeFreshTx = (settingValue: string | null = '4'): MockTx => ({
  service: { findUnique: jest.fn().mockResolvedValue(null) },
  radCheck: { findFirst: jest.fn().mockResolvedValue(null) },
  systemSetting: {
    findUnique: jest.fn().mockResolvedValue(settingValue === null ? null : { value: settingValue }),
  },
});

describe('ServiceSecretGenerator (unit)', () => {
  let service: ServiceSecretGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceSecretGenerator,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();
    service = module.get(ServiceSecretGenerator);
  });

  describe('composeUsername (pure)', () => {
    it('formats as {customerCode}_{randomN} with default length 4', () => {
      const username = service.composeUsername('REG26050001');
      expect(username).toMatch(/^REG26050001_[a-z2-9]{4}$/);
      expect(username.split(USERNAME_SEPARATOR)).toHaveLength(2);
    });

    it('respects randomLength', () => {
      const username = service.composeUsername('REG26050001', 6);
      expect(username).toMatch(/^REG26050001_[a-z2-9]{6}$/);
    });

    it('only uses non-confusable charset (no 0/1/i/l/o)', () => {
      for (let i = 0; i < 200; i += 1) {
        const username = service.composeUsername('XYZ', 6);
        const suffix = username.split(USERNAME_SEPARATOR)[1];
        for (const ch of suffix) {
          expect(USERNAME_CHARSET).toContain(ch);
        }
        expect(suffix).not.toMatch(/[01ilo]/);
      }
    });

    it('throws when randomLength < 2', () => {
      expect(() => service.composeUsername('X', 1)).toThrow(/randomLength must be >= 2/);
      expect(() => service.composeUsername('X', 0)).toThrow(/randomLength must be >= 2/);
    });
  });

  describe('generatePassword (pure)', () => {
    it('defaults to length 12', () => {
      const pw = service.generatePassword();
      expect(pw).toHaveLength(12);
    });

    it('respects explicit length', () => {
      expect(service.generatePassword(16)).toHaveLength(16);
      expect(service.generatePassword(24)).toHaveLength(24);
    });

    it('only uses non-confusable charset', () => {
      for (let i = 0; i < 50; i += 1) {
        const pw = service.generatePassword(20);
        for (const ch of pw) {
          expect(PASSWORD_CHARSET).toContain(ch);
        }
        expect(pw).not.toMatch(/[01IiLlOo]/);
      }
    });

    it('rejects very short passwords', () => {
      expect(() => service.generatePassword(5)).toThrow(/length must be >= 6/);
    });

    it('produces high entropy (no duplicates over 200 generations)', () => {
      const set = new Set<string>();
      for (let i = 0; i < 200; i += 1) {
        set.add(service.generatePassword(12));
      }
      expect(set.size).toBe(200);
    });
  });

  describe('generateUsername (mocked tx)', () => {
    it('returns first candidate when DB is free', async () => {
      const tx = makeFreshTx();
      const username = await service.generateUsername('REG26050001', {}, asTx(tx));
      expect(username).toMatch(/^REG26050001_[a-z2-9]{4}$/);
      expect(tx.service.findUnique).toHaveBeenCalledTimes(1);
      expect(tx.radCheck.findFirst).toHaveBeenCalledTimes(1);
    });

    it('retries when first candidate is taken in services', async () => {
      const tx = makeFreshTx();
      // First call: services.findUnique returns existing row → taken
      // Second call: returns null → free
      tx.service.findUnique.mockResolvedValueOnce({ id: 1n }).mockResolvedValueOnce(null);

      const username = await service.generateUsername('REG26050001', {}, asTx(tx));
      expect(tx.service.findUnique).toHaveBeenCalledTimes(2);
      expect(username).toMatch(/^REG26050001_[a-z2-9]{4}$/);
    });

    it('retries when candidate is taken in radcheck', async () => {
      const tx = makeFreshTx();
      tx.radCheck.findFirst.mockResolvedValueOnce({ id: 99n }).mockResolvedValueOnce(null);

      const username = await service.generateUsername('REG26050001', {}, asTx(tx));
      expect(tx.radCheck.findFirst).toHaveBeenCalledTimes(2);
      expect(username).toMatch(/^REG26050001_[a-z2-9]{4}$/);
    });

    it('throws ServiceSecretCollisionError after max retries', async () => {
      const tx = makeFreshTx();
      // Force every check to report "taken"
      tx.service.findUnique.mockResolvedValue({ id: 1n });

      await expect(
        service.generateUsername('REG26050001', { maxRetries: 3 }, asTx(tx)),
      ).rejects.toBeInstanceOf(ServiceSecretCollisionError);
      expect(tx.service.findUnique).toHaveBeenCalledTimes(3);
    });

    it('reads randomLength from system_settings', async () => {
      const tx = makeFreshTx('6');
      const username = await service.generateUsername('REG26050001', {}, asTx(tx));
      const suffix = username.split(USERNAME_SEPARATOR)[1];
      expect(suffix).toHaveLength(6);
    });

    it('falls back to default randomLength=4 when setting is missing', async () => {
      const tx = makeFreshTx(null);
      const username = await service.generateUsername('REG26050001', {}, asTx(tx));
      const suffix = username.split(USERNAME_SEPARATOR)[1];
      expect(suffix).toHaveLength(4);
    });

    it('falls back to default when setting is non-numeric', async () => {
      const tx = makeFreshTx('not-a-number');
      const username = await service.generateUsername('REG26050001', {}, asTx(tx));
      const suffix = username.split(USERNAME_SEPARATOR)[1];
      expect(suffix).toHaveLength(4);
    });

    it('rejects blank customerCode', async () => {
      const tx = makeFreshTx();
      await expect(service.generateUsername('', {}, asTx(tx))).rejects.toThrow(
        /customerCode is required/,
      );
      await expect(service.generateUsername('   ', {}, asTx(tx))).rejects.toThrow(
        /customerCode is required/,
      );
    });
  });

  describe('generate (bundle)', () => {
    it('returns username + password', async () => {
      const tx = makeFreshTx();
      const secret = await service.generate('REG26050001', {}, asTx(tx));
      expect(secret.username).toMatch(/^REG26050001_[a-z2-9]{4}$/);
      expect(secret.password).toHaveLength(12);
    });

    it('honors passwordLength override', async () => {
      const tx = makeFreshTx();
      const secret = await service.generate('REG26050001', { passwordLength: 20 }, asTx(tx));
      expect(secret.password).toHaveLength(20);
    });
  });
});
