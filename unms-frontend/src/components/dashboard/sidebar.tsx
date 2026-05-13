'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Server,
  FileText,
  CreditCard,
  Ticket,
  Network,
  Package,
  BarChart3,
  Sparkles,
  Settings,
  ShieldCheck,
  FileSearch,
  ChevronLeft,
  ChevronRight,
  Wifi,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  hasChildren?: boolean;
  badge?: string;
}

const navItems: ReadonlyArray<NavItem> = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Pelanggan', icon: Users, href: '/pelanggan', hasChildren: true },
  { label: 'Layanan', icon: Server, href: '/layanan', hasChildren: true },
  { label: 'Invoice & Billing', icon: FileText, href: '/invoice', hasChildren: true },
  { label: 'Pembayaran', icon: CreditCard, href: '/pembayaran' },
  { label: 'Tiket & SLA', icon: Ticket, href: '/tiket', hasChildren: true },
  { label: 'Router & Perangkat', icon: Network, href: '/router', hasChildren: true },
  { label: 'Paket Layanan', icon: Package, href: '/paket' },
  { label: 'Laporan', icon: BarChart3, href: '/laporan', hasChildren: true },
  { label: 'AI Analytics', icon: Sparkles, href: '/ai', badge: 'New' },
  { label: 'Pengaturan', icon: Settings, href: '/pengaturan', hasChildren: true },
  { label: 'User & Role', icon: ShieldCheck, href: '/user-role', hasChildren: true },
  { label: 'Audit Trail', icon: FileSearch, href: '/audit' },
];

interface SidebarProps {
  activeHref?: string;
}

export function Sidebar({ activeHref = '/' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-[248px]',
      )}
      aria-label="Navigasi utama"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div
          className={cn(
            'flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border',
            collapsed && 'justify-center px-3',
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wifi className="h-5 w-5" aria-hidden />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-tight">UNMS</span>
              <span className="text-[11px] text-muted-foreground">Billing System</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === activeHref;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                      collapsed && 'justify-center px-0',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <Badge className="h-5 bg-primary/10 text-primary px-1.5 text-[10px]">
                            {item.badge}
                          </Badge>
                        )}
                        {item.hasChildren && (
                          <ChevronRight
                            className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100"
                            aria-hidden
                          />
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'mx-3 mb-3 flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar px-3 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors',
            collapsed && 'justify-center px-0',
          )}
          aria-label={collapsed ? 'Perluas sidebar' : 'Minimalkan sidebar'}
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
            aria-hidden
          />
          {!collapsed && <span>Minimalkan</span>}
        </button>

        {/* Footer card */}
        {!collapsed && (
          <div className="mx-3 mb-4 overflow-hidden rounded-xl border border-sidebar-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-3 dark:from-sky-500/10 dark:via-transparent dark:to-blue-500/10">
            <div className="text-[11px] text-muted-foreground">UNMS v2.3.0</div>
            <div className="text-[11px] text-muted-foreground">© 2025 UNMS Corp.</div>
            <svg
              className="mt-2 h-8 w-full text-sky-300"
              viewBox="0 0 200 30"
              fill="none"
              aria-hidden
            >
              <path
                d="M0 20 Q 30 5 60 18 T 120 18 T 200 12"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M0 26 Q 40 14 80 22 T 160 18 T 200 22"
                stroke="currentColor"
                strokeWidth="1.25"
                opacity="0.6"
              />
            </svg>
          </div>
        )}
      </div>
    </aside>
  );
}
