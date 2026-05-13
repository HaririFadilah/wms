import type { ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';

interface AppShellProps {
  children: ReactNode;
  activeNav?: string;
  breadcrumb: ReadonlyArray<string>;
}

export function AppShell({ children, activeNav = '/', breadcrumb }: AppShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Sidebar activeHref={activeNav} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar breadcrumb={breadcrumb} />
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
