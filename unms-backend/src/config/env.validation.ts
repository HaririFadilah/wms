import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3001;

  @IsString()
  APP_NAME: string = 'UNMS Billing API';

  @IsString()
  API_PREFIX: string = 'api/v1';

  @IsString()
  @IsOptional()
  CORS_ORIGINS: string = 'http://localhost:3000';

  @IsString()
  @IsOptional()
  DATABASE_URL?: string;

  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsInt()
  @IsOptional()
  REDIS_PORT?: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  // JWT_ACCESS_SECRET / JWT_REFRESH_SECRET are required for the auth module to issue tokens.
  // They MUST be set to long random strings in production. Dev/test get sensible defaults
  // via .env.example so the app boots out-of-the-box.
  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  /** Access token TTL in seconds (default 15 min). */
  @IsInt()
  @Min(60)
  JWT_ACCESS_TTL: number = 15 * 60;

  /** Refresh token TTL in seconds (default 7 days). */
  @IsInt()
  @Min(60)
  JWT_REFRESH_TTL: number = 7 * 24 * 60 * 60;

  /** Bcrypt cost for password hashing (default 10). */
  @IsInt()
  @Min(4)
  @Max(15)
  BCRYPT_ROUNDS: number = 10;

  @IsString()
  @IsOptional()
  LOG_LEVEL: string = 'info';
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const formatted = errors
      .map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${formatted}`);
  }

  return validatedConfig;
}
