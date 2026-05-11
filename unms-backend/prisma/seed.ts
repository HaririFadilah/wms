/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('[seed] starting...');

  // Global customer code counter — wajib ada sebelum CustomerCodeService dipakai (BE-0101).
  await prisma.systemCounter.upsert({
    where: { key: 'customer_global_sequence' },
    create: { key: 'customer_global_sequence', currentValue: 0n },
    update: {},
  });

  // Minimal default system settings.
  const defaultSettings: Array<{ key: string; value: string; group: string }> = [
    { key: 'system.timezone', value: 'Asia/Jakarta', group: 'system' },
    { key: 'system.currency', value: 'IDR', group: 'system' },
    { key: 'customer_code.prefix', value: 'REG', group: 'customer' },
    { key: 'service.provisioning_mode.default', value: 'radius', group: 'service' },
    { key: 'service.secret.random_length', value: '4', group: 'service' },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      create: s,
      update: {},
    });
  }

  console.log('[seed] done. Counters:', await prisma.systemCounter.count());
  console.log('[seed] settings:', await prisma.systemSetting.count());
}

main()
  .catch((err: unknown) => {
    console.error('[seed] failed', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
