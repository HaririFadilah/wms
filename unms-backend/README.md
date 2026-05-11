# UNMS Backend (unms-backend)

NestJS API for UNMS Billing System (ISP/NAP scale). This folder is independent from `wms-backend`.

## Status
Sprint 0 — BE-0001 complete (foundation only). DB, Redis, Queue, Radius, Auth, dan modul bisnis menyusul.

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
npm run start:dev    # development
npm run build        # production build
npm run lint         # ESLint
```

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
src/
  common/
    filters/all-exceptions.filter.ts
    interceptors/
      logging.interceptor.ts
      response.interceptor.ts
    middlewares/request-id.middleware.ts
  config/env.validation.ts
  modules/health/
    health.controller.ts
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
