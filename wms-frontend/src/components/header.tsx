"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Bell, LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { mobileNav } from "./sidebar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    api
      .get("/notifications/unread-count")
      .then((res) => setUnreadCount(res.data.unread_count))
      .catch(() => {});
  }, [pathname]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0 bg-sidebar">
            <div className="flex h-16 items-center gap-3 border-b border-border px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
              </div>
              <span className="font-heading text-lg font-bold text-foreground">WMS</span>
            </div>
            <nav className="flex flex-col gap-1 py-4 px-3">
              {mobileNav.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-text2 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-[18px] w-[18px]", active && "text-primary")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Search bar */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2">
          <Search className="h-4 w-4 text-text3" />
          <input
            type="text"
            placeholder="Cari barang, lokasi..."
            className="bg-transparent border-none outline-none text-foreground text-[13px] w-[200px] placeholder:text-text3"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-text2 hover:bg-muted hover:text-foreground transition-all"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        )}

        {/* Notification bell */}
        <Link href="/notifications" className="relative">
          <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-text2 hover:bg-muted hover:text-foreground transition-all">
            <Bell className="h-4 w-4" />
          </button>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[9px] text-white flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2 px-2 rounded-xl" />}>
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="hidden sm:inline text-sm font-medium">{user?.name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem className="text-xs text-muted-foreground rounded-lg">
              {user?.email} ({user?.role})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => logout()} className="rounded-lg">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
