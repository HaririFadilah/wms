'use client';

import { useTheme } from 'next-themes';
import { Bell, ChevronRight, Menu, Moon, Search, Sun, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopbarProps {
  breadcrumb: ReadonlyArray<string>;
  userName?: string;
  userRole?: string;
  notificationCount?: number;
}

export function Topbar({
  breadcrumb,
  userName = 'Admin UNMS',
  userRole = 'Super Admin',
  notificationCount = 12,
}: TopbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const last = breadcrumb[breadcrumb.length - 1];
  const head = breadcrumb.slice(0, -1);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      {/* Breadcrumb */}
      <nav
        className="hidden md:flex items-center gap-1.5 text-sm"
        aria-label="Breadcrumb"
      >
        {head.map((crumb) => (
          <span key={crumb} className="flex items-center gap-1.5 text-muted-foreground">
            {crumb}
            <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden />
          </span>
        ))}
        {last && <span className="font-medium text-primary">{last}</span>}
      </nav>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:block w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari pelanggan, invoice, tiket, perangkat..."
          className="pl-9 pr-12 h-10 bg-muted/40 border-border focus-visible:bg-background"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      {/* Notification bell */}
      <button
        type="button"
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-muted transition-colors"
        aria-label={`${notificationCount} notifikasi belum dibaca`}
      >
        <Bell className="h-5 w-5 text-muted-foreground" aria-hidden />
        {notificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {notificationCount}
          </span>
        )}
      </button>

      {/* Theme toggle */}
      <div
        className="flex h-10 items-center gap-2 rounded-full bg-muted/60 px-2"
        aria-label="Tema tampilan"
      >
        <Sun className="h-4 w-4 text-amber-500" aria-hidden />
        <Switch
          checked={isDark}
          onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
          aria-label="Toggle tema gelap"
        />
        <Moon className="h-4 w-4 text-slate-500" aria-hidden />
      </div>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full pl-2 pr-3 py-1 hover:bg-muted transition-colors">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {userName
                .split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:flex flex-col items-start leading-tight text-left">
            <span className="text-sm font-semibold">{userName}</span>
            <span className="text-[11px] text-muted-foreground">{userRole}</span>
          </div>
          <ChevronDown className="hidden lg:block h-4 w-4 text-muted-foreground" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{userName}</span>
              <span className="text-xs text-muted-foreground">{userRole}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profil saya</DropdownMenuItem>
          <DropdownMenuItem>Pengaturan akun</DropdownMenuItem>
          <DropdownMenuItem>Aktivitas</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
