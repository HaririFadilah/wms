# UNMS Backend (unms-backend)

NestJS API for UNMS Billing System (ISP/NAP scale). This folder is independent from `wms-backend`.

## Status
- BE-0001 (foundation) — done
- BE-0003 (Prisma + MySQL setup) — done
- BE-0004 (core database schema lengkap + seed RBAC) — done
- BE-0101 (CustomerCodeService — atomic global counter + Jest setup + 15 tests) — done
- BE-0102 (ServiceSecretGenerator — unique pppoe_username + radcheck + retry + 24 tests) — done
- BE-0002 (full docker-compose stack), BE-0201 (auth wiring), modul bisnis — menyusul.

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

## Acceptance Criteria (BE-0102)
- [x] `ServiceSecretGenerator.generate(customerCode)` produces `{ username, password }`
- [x] Username = `{customerCode}_{randomN}` (N dari `system_settings.service.secret.random_length`, default 4)
- [x] Username unique across **both** `services.pppoe_username` AND `radcheck.username` (FreeRadius)
- [x] Retry on collision (default 8 attempts) → throws `ServiceSecretCollisionError` kalau exhausted
- [x] Password 12 char default, crypto-secure (`crypto.randomInt`), non-confusable charset
- [x] Username charset 32 chars non-confusable (32⁴ ≈ 1M combos per customer)
- [x] Supports passing outer `Prisma.TransactionClient` (consistent dengan BE-0101 pattern)
- [x] 24 tests passing (17 unit, 7 integration)
- [x] Concurrency test: 50 parallel → all unique
- [x] Collision exhaustion test: pre-fill 1024 radcheck rows, `randomLength=2`, `maxRetries=5` → throws
- [x] `npm run build` & `npm run lint` OK

## Acceptance Criteria (BE-0101)
- [x] `CustomerCodeService.generateCustomerCode()` produces `{PREFIX}{YY}{MM}{NNNN}` (e.g. `REG26050042`)
- [x] Counter `customer_global_sequence` is **GLOBAL** and never reset (verified by tests)
- [x] Row-lock via `SELECT ... FOR UPDATE` inside `SERIALIZABLE` transaction
- [x] Supports passing an outer `Prisma.TransactionClient` (atomic with caller's other writes)
- [x] Rollback in outer tx **undoes** the counter increment (atomic guarantee verified)
- [x] Concurrency test: 100 parallel calls → all codes unique, counter += 100
- [x] Jest setup (test runner, ts-jest, BigInt JSON helper)
- [x] 15 tests passing (10 unit, 5 integration)
- [x] `npm run build` & `npm run lint` OK

## Acceptance Criteria (BE-0004)
- [x] Schema lengkap untuk seluruh domain UNMS (auth, customer, service, billing, network, radius, ticketing, summary)
- [x] Index strategy untuk skala 500k+ (`customers(code)` unique, `services(pppoe_username)` unique, composite indexes pada (status, dueDate), (customer_id, status), dsb)
- [x] FreeRadius standard tables (`radcheck`, `radreply`, `radusergroup`, `radgroupcheck`, `radgroupreply`, `radacct`, `radpostauth`, `nas`) ikut di-manage Prisma
- [x] 7 summary tables siap dipakai dashboard tanpa scan tabel utama
- [x] Seed:
  - 53 permissions (15 group)
  - 5 system roles (superadmin/admin/finance/technician/csr) dengan permission mapping
  - 1 superadmin user (`admin@unms.local` / `admin123` — ROTATE)
  - 9 default `system_settings` (timezone, currency, customer_code prefix, dll)
  - 1 counter `customer_global_sequence`
- [x] Seed idempotent (re-run tidak duplikat)
- [x] `npm run build` & `npm run lint` OK
- [x] Server start + `/health` `db: "up"` masih bekerja

## Acceptance Criteria (BE-0003)
- [x] Prisma migration berhasil (`npm run prisma:migrate:dev` membuat `_prisma_migrations`, `system_counters`, `system_settings`)
- [x] Prisma seed berhasil (counter `customer_global_sequence` + 5 default settings)
- [x] `PrismaService` reusable, di-export via `@Global() PrismaModule`
- [x] Tidak ada multiple `PrismaClient` instance — semua DI lewat `PrismaService`
- [x] `runInTransaction()` helper tersedia (default `SERIALIZABLE` isolation)
- [x] `/health` `checks.db` adalah `up` saat DB hidup, `down` saat DB mati
