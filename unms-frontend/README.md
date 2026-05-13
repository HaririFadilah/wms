# UNMS Frontend (unms-frontend)

Next.js 16 admin app for the UNMS Billing System (ISP/NAP). Independent from `wms-frontend` (legacy WMS Next.js app at repo root).

## Status

- **FE-0001 (setup)** — done
  Next.js 16 App Router · TypeScript strict (+ `noUncheckedIndexedAccess`) · Tailwind CSS 4 · shadcn/ui (Nova preset) · TanStack Query v5 · Zustand (auth skeleton) · React Hook Form + Zod · Axios + envelope unwrap · next-themes (dark default) · Sonner toaster · Prettier + ESLint.
- **FE-0002** — typed API client + global error toast + automatic 401 refresh interceptor (TBD).
- **FE-0003** — design-system components (sidebar, topbar, data table, status badges, theming tokens) (TBD).
- **FE-0101** — login page + authenticated layout + route guards calling `POST /api/v1/auth/login` (TBD).

## Scripts

```bash
npm install
cp .env.example .env.local      # set NEXT_PUBLIC_API_URL to your unms-backend
npm run dev                     # http://localhost:3000 (or PORT=3002 npm run dev)
npm run build                   # production build (Turbopack)
npm run start                   # serve the production build
npm run lint                    # ESLint
npm run typecheck               # tsc --noEmit (strict)
npm run format                  # Prettier write
npm run format:check            # Prettier verify
```

## Env vars

| Var | Required | Default | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | `http://localhost:3001/api/v1` | Base URL for `unms-backend` |

## What's wired up in FE-0001

- **Root layout** mounts the Geist + Geist Mono fonts and wraps everything in `Providers`
- **`Providers`** = `ThemeProvider` (next-themes, `class` strategy, default `dark`) → `QueryClientProvider` (TanStack Query, sensible defaults: `staleTime 30s`, `gcTime 5min`, no refetch on focus, single retry) → app → `Toaster` (sonner, top-right, rich colors) → `ReactQueryDevtools` (dev only)
- **Axios client** (`src/lib/api.ts`) with response interceptor that unwraps the `{ success, message, data, meta }` envelope from `unms-backend`. Errors are rethrown as `ApiClientError` so callers can `instanceof` discriminate
- **Auth store** (`src/stores/auth.store.ts`) Zustand + persist (localStorage), exposes `user`, `accessToken`, `refreshToken`, `setSession`, `clearSession`, `hasAllPermissions(...codes)`, `hasHydrated`
- **Typed envelope** (`src/types/api.ts`) — `ApiResponse<T>`, `AuthUser`, `LoginResponse` mirror backend shapes
- **shadcn/ui** Nova preset, base color `neutral`, components: `button`, `card`, `input`, `label`, `sonner`
- Placeholder landing page at `/` (real dashboard lands in FE-0401)

## Folder layout

```
unms-frontend/
  src/
    app/
      layout.tsx             # root layout + Providers
      page.tsx               # placeholder landing
      providers.tsx          # ThemeProvider + QueryClient + Toaster
      globals.css            # Tailwind 4 + shadcn theme vars
    components/
      ui/                    # shadcn components (button, card, input, label, sonner)
    lib/
      api.ts                 # axios instance + envelope unwrap (FE-0002 will extend)
      utils.ts               # cn() helper (shadcn)
    stores/
      auth.store.ts          # Zustand auth skeleton
    types/
      api.ts                 # ApiResponse<T>, AuthUser, LoginResponse
  components.json            # shadcn config
  eslint.config.mjs
  tsconfig.json              # strict + noUncheckedIndexedAccess
  postcss.config.mjs
  next.config.ts
  .prettierrc, .prettierignore
  .env.example
```

## Acceptance Criteria (FE-0001)

- [x] `npm install` clean
- [x] `npm run dev` → http 200 on `/`, page renders (verified manually)
- [x] `npm run build` → success, all routes static
- [x] `npm run lint` → 0 errors
- [x] `npm run typecheck` → 0 errors
- [x] shadcn `button`, `card`, `input`, `label`, `sonner` present in `src/components/ui/`
- [x] `QueryClientProvider` mounted, devtools visible in dev
- [x] `next-themes` dark theme applies on first paint
- [x] `Toaster` mounted (sonner) so any module can call `toast.success/error/info`
- [x] Envelope unwrap works (axios response interceptor)
- [x] Auth store persists to localStorage, hydration flag exposed

## Notes for next tasks

- Backend base URL is hardcoded for dev to `http://localhost:3001/api/v1`. Match the port of `unms-backend` (default 3001 in its `.env.example`).
- Token refresh logic is **not** in this task; the axios interceptor only unwraps envelopes. FE-0002 will add request interceptor for `Authorization` header + retry-on-401-with-refresh.
- shadcn Nova preset uses Geist sans + Geist mono, matches `next/font` already wired in `layout.tsx`. Don't manually load fonts elsewhere.
