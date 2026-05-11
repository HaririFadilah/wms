# UNMS Backend (unms-backend)

NestJS API for UNMS Billing System (ISP/NAP scale). This folder is independent from `wms-backend`.

## Status
- BE-0001 (foundation) — done
- BE-0003 (Prisma + MySQL setup) — done
- BE-0002 (full docker-compose stack), BE-0004 (full schema), BE-0201 (auth), modul bisnis — menyusul.

## Stack (target)
- NestJS 11 + TypeScript strict
- Prisma + MySQL 8 (BE-0003)
- Redis cache (Sprint berikutnya)
- BullMQ workers
- FreeRadius integration

## Scripts
```bash
npm install
cp .env.example .env
# 1) Spin up MySQL
docker compose -f ../docker-compose.unms.dev.yml up -d unms-mysql
# 2) Migrate + seed
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
# 3) Run
npm run start:dev    # development
npm run build        # production build
npm run lint         # ESLint
```

Lihat juga: [prisma/README.md](./prisma/README.md).

## What's wired up in BE-0001
- `ConfigModule` global with `validateEnv` (class-validator)
- `RequestIdMiddleware` — sets/propagates `x-request-id`
- `LoggingInterceptor` — `[reqId] METHOD url status ms`
- `ResponseInterceptor` — wraps responses to `{ success, message, data, meta:{ requestId, ... } }`
- `AllExceptionsFilter` — consistent error JSON `{ success:false, message, code, errors?, meta }`
- Global `ValidationPipe` (whitelist + transform + forbidNonWhitelisted)
- `GET /health` returns `{ status, service, version, uptimeSec, timestamp, checks }`
- `setGlobalPrefix('api/v1')` (except `/health`)
- CORS configurable via `CORS_ORIGINS` (comma-separated)

## Folder layout
```
prisma/
  schema.prisma
  seed.ts
  migrations/
src/
  common/
    filters/all-exceptions.filter.ts
    interceptors/
      logging.interceptor.ts
      response.interceptor.ts
    middlewares/request-id.middleware.ts
  config/env.validation.ts
  database/
    prisma.module.ts          # @Global() module
    prisma.service.ts         # singleton PrismaClient + runInTransaction helper
  modules/health/
    health.controller.ts      # checks DB via prisma.ping()
    health.module.ts
  app.module.ts
  main.ts
```

## Acceptance Criteria (BE-0001)
- [x] `npm run build` success
- [x] `npm run lint` success
- [x] `/health` returns API/DB/Redis status payload
- [x] All env vars validated at startup (`validateEnv`)
- [x] Error response shape consistent across all thrown exceptions

## Acceptance Criteria (BE-0003)
- [x] Prisma migration berhasil (`npm run prisma:migrate:dev` membuat `_prisma_migrations`, `system_counters`, `system_settings`)
- [x] Prisma seed berhasil (counter `customer_global_sequence` + 5 default settings)
- [x] `PrismaService` reusable, di-export via `@Global() PrismaModule`
- [x] Tidak ada multiple `PrismaClient` instance — semua DI lewat `PrismaService`
- [x] `runInTransaction()` helper tersedia (default `SERIALIZABLE` isolation)
- [x] `/health` `checks.db` adalah `up` saat DB hidup, `down` saat DB mati
