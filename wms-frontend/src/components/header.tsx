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

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/items": "Manajemen Barang",
  "/categories": "Manajemen Kategori",
  "/locations": "Lokasi Gudang",
  "/stock-in": "Stok Masuk",
  "/stock-out": "Stok Keluar",
  "/transfers": "Transfer Barang",
  "/stock-adjustments": "Adjustment Stok",
  "/reports": "Laporan",
  "/notifications": "Notifikasi",
  "/activity-logs": "Riwayat Aktivitas",
};

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

  const pageTitle = pageTitles[pathname] || "WMS";

  return (
    <header className="flex h-[60px] items-center justify-between border-b border-border bg-sidebar px-4 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0 bg-sidebar">
            <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-primary-foreground">
                  <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm-9 9H7v-4h4v4zm6 0h-4v-4h4v4zM20 7H4V5a2 2 0 012-2h12a2 2 0 012 2v2z" />
                </svg>
              </div>
              <span className="font-heading text-lg font-bold text-foreground">
                W<span className="text-primary">M</span>S
              </span>
            </div>
            <nav className="flex flex-col gap-1 py-4 px-3">
              {mobileNav.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] font-medium transition-all",
                      active
                        ? "bg-lime-glow text-primary border border-lime-border"
                        : "text-text2 hover:bg-accent hover:text-foreground border border-transparent"
                    )}
                  >
                    <item.icon className={cn("h-[18px] w-[18px]", active ? "opacity-100" : "opacity-70")} />
                    {item.label}
                    {active && (
                      <span className="absolute right-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className="font-heading text-lg font-bold text-foreground">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-2.5">
        {/* Search bar */}
        <div className="hidden sm:flex items-center gap-2 rounded-[10px] border border-border bg-accent px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-text3" />
          <input
            type="text"
            placeholder="Cari barang, lokasi..."
            className="bg-transparent border-none outline-none text-foreground text-[13px] w-[180px] placeholder:text-text3"
          />
        </div>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-input bg-transparent text-text2 hover:bg-accent hover:text-foreground transition-all"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Notification bell */}
        <Link href="/notifications" className="relative">
          <button className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-input bg-transparent text-text2 hover:bg-accent hover:text-foreground transition-all">
            <Bell className="h-4 w-4" />
          </button>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-sidebar" />
          )}
        </Link>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2 px-2" />}>
            <div className="h-7 w-7 rounded-[10px] bg-gradient-to-br from-primary to-[#2dd4bf] flex items-center justify-center text-xs font-bold text-primary-foreground">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="hidden sm:inline text-sm font-medium">{user?.name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-xs text-muted-foreground">
              {user?.email} ({user?.role})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
