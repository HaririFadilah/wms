// Placeholder landing for FE-0001 setup verification. Real dashboard lives in
// FE-0003 (design system) + FE-0401 (dashboard). This page only confirms the
// stack is wired correctly (Tailwind, shadcn, fonts, themes).

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const STACK = [
  { name: 'Next.js 16 · App Router', status: 'ready' },
  { name: 'TypeScript · strict', status: 'ready' },
  { name: 'Tailwind CSS 4', status: 'ready' },
  { name: 'shadcn/ui · Nova preset', status: 'ready' },
  { name: 'TanStack Query v5', status: 'ready' },
  { name: 'Zustand (auth store skeleton)', status: 'ready' },
  { name: 'React Hook Form + Zod', status: 'ready' },
  { name: 'Axios + envelope unwrap', status: 'ready' },
  { name: 'next-themes (dark default)', status: 'ready' },
  { name: 'Sonner toaster', status: 'ready' },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          UNMS Frontend · FE-0001
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Setup complete.</h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          This is the temporary landing page for the UNMS admin app. Login, dashboard,
          customer management, and billing UIs land in subsequent FE-* tasks.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Stack wired up</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {STACK.map((item) => (
              <li
                key={item.name}
                className="border-border/60 bg-muted/30 flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span>{item.name}</span>
                <span className="text-emerald-500 dark:text-emerald-400">ready</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>FE-0002</strong> — typed API client + global error toast + automatic
            401 refresh interceptor.
          </p>
          <p>
            <strong>FE-0003</strong> — design system: sidebar, topbar, data table,
            empty-state, status badges, theming tokens.
          </p>
          <p>
            <strong>FE-0101</strong> — login page + authenticated layout shell + route
            guards (calls <code className="text-xs">POST /api/v1/auth/login</code>).
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="https://github.com/HaririFadilah/wms" target="_blank">
            View repository
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/api/health" target="_blank">
            /api/health (placeholder)
          </Link>
        </Button>
      </div>

      <footer className="text-muted-foreground border-border/40 mt-auto border-t pt-4 text-xs">
        UNMS · Sprint 0 · setup verification only — not production UI.
      </footer>
    </main>
  );
}
