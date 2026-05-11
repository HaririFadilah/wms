import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { EnvironmentVariables, NodeEnv } from '@/config/env.validation';

/**
 * Singleton/global Prisma client.
 *
 * - Query/info logging hanya saat NODE_ENV !== production
 * - Best practice: jangan instantiate `new PrismaClient()` di tempat lain.
 *   Selalu inject `PrismaService` lewat DI.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    const env = config.get('NODE_ENV', { infer: true });
    const url = config.get('DATABASE_URL', { infer: true });

    const isDev = env !== NodeEnv.Production;

    super({
      datasources: url ? { db: { url } } : undefined,
      log: isDev
        ? [
            { level: 'warn', emit: 'event' },
            { level: 'error', emit: 'event' },
            { level: 'info', emit: 'event' },
          ]
        : [
            { level: 'warn', emit: 'event' },
            { level: 'error', emit: 'event' },
          ],
      errorFormat: isDev ? 'pretty' : 'minimal',
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Prisma connected');
    } catch (err) {
      // Do not crash the app — allow /health to report db=down so operators can react.
      // Production deployments should still alert on degraded health.
      this.logger.error(
        'Prisma failed to connect on startup (app will continue, /health will report db=down)',
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma disconnected');
  }

  /**
   * Lightweight liveness check used by /health and others.
   * Throws if DB is unreachable.
   */
  async ping(): Promise<true> {
    await this.$queryRaw`SELECT 1`;
    return true;
  }

  /**
   * Transaction helper:
   *   const result = await prisma.runInTransaction(async (tx) => { ... });
   *
   * - Default isolation: SERIALIZABLE (aman untuk billing/payment/counter update).
   * - maxWait & timeout di-set generous untuk job billing besar.
   *
   * Selalu pakai parameter `tx` di dalam callback, jangan panggil `this.<model>`
   * lagi supaya operasi tetap atomic.
   */
  runInTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): Promise<T> {
    return this.$transaction(fn, {
      maxWait: options?.maxWait ?? 5_000,
      timeout: options?.timeout ?? 15_000,
      isolationLevel: options?.isolationLevel ?? Prisma.TransactionIsolationLevel.Serializable,
    });
  }
}
