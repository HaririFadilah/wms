import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import { EnvironmentVariables } from '@/config/env.validation';
import { Public } from '@/modules/auth/decorators/public.decorator';

interface HealthCheckResult {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  uptimeSec: number;
  timestamp: string;
  checks: {
    api: 'up';
    db: 'up' | 'down' | 'not_configured';
    redis: 'up' | 'down' | 'not_configured';
  };
}

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly config: ConfigService<EnvironmentVariables, true>,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async check(): Promise<HealthCheckResult> {
    const appName = this.config.get('APP_NAME', { infer: true });
    const dbUrl = this.config.get('DATABASE_URL', { infer: true });
    const redisHost = this.config.get('REDIS_HOST', { infer: true });

    let db: HealthCheckResult['checks']['db'] = 'not_configured';
    if (dbUrl) {
      try {
        await this.prisma.ping();
        db = 'up';
      } catch {
        db = 'down';
      }
    }

    return {
      status: db === 'down' ? 'degraded' : 'ok',
      service: appName,
      version: '0.1.0',
      uptimeSec: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      checks: {
        api: 'up',
        db,
        redis: redisHost ? 'not_configured' : 'not_configured',
      },
    };
  }
}
