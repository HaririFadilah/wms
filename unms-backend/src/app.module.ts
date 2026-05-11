import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { PrismaModule } from '@/database/prisma.module';
import { validateEnv } from '@/config/env.validation';
import { CustomerCodeModule } from '@/modules/customer-code/customer-code.module';
import { HealthModule } from '@/modules/health/health.module';
import { ServiceSecretModule } from '@/modules/service-secret/service-secret.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    CustomerCodeModule,
    ServiceSecretModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: (): ValidationPipe =>
        new ValidationPipe({
          whitelist: true,
          transform: true,
          forbidNonWhitelisted: true,
          transformOptions: { enableImplicitConversion: true },
        }),
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
