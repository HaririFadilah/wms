import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { RequestIdMiddleware } from './common/middlewares/request-id.middleware';
import { EnvironmentVariables } from './config/env.validation';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: false,
  });

  const config = app.get(ConfigService<EnvironmentVariables, true>);
  const port = config.get('PORT', { infer: true });
  const apiPrefix = config.get('API_PREFIX', { infer: true });
  const corsOrigins = (config.get('CORS_ORIGINS', { infer: true }) ?? '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  const requestIdMiddleware = new RequestIdMiddleware();
  app.use(requestIdMiddleware.use.bind(requestIdMiddleware));

  app.setGlobalPrefix(apiPrefix, { exclude: ['health'] });
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  });
  app.enableShutdownHooks();

  await app.listen(port);
  Logger.log(
    `UNMS Backend listening on http://0.0.0.0:${port} (prefix: ${apiPrefix})`,
    'Bootstrap',
  );
}

bootstrap().catch((err: unknown) => {
  Logger.error('Failed to bootstrap UNMS Backend', err as Error, 'Bootstrap');
  process.exit(1);
});
