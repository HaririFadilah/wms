import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@/config/env.validation';

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

@Controller('health')
export class HealthController {
  constructor(private readonly config: ConfigService<EnvironmentVariables, true>) {}

  @Get()
  check(): HealthCheckResult {
    const appName = this.config.get('APP_NAME', { infer: true });
    const dbUrl = this.config.get('DATABASE_URL', { infer: true });
    const redisHost = this.config.get('REDIS_HOST', { infer: true });

    return {
      status: 'ok',
      service: appName,
      version: '0.1.0',
      uptimeSec: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      checks: {
        api: 'up',
        db: dbUrl ? 'not_configured' : 'not_configured',
        redis: redisHost ? 'not_configured' : 'not_configured',
      },
    };
  }
}
