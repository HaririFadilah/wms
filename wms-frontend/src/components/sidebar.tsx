"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import {
  ArrowLeftRight,
  Bell,
  Box,
  ChartBar,
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  MapPin,
  PackageMinus,
  PackagePlus,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navSections = [
  {
    label: "Utama",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Notifikasi", href: "/notifications", icon: Bell },
    ],
  },
  {
    label: "Inventori",
    items: [
      { label: "Barang", href: "/items", icon: Box },
      { label: "Kategori", href: "/categories", icon: FolderOpen },
      { label: "Lokasi Gudang", href: "/locations", icon: MapPin },
    ],
  },
  {
    label: "Transaksi",
    items: [
      { label: "Stok Masuk", href: "/stock-in", icon: PackagePlus },
      { label: "Stok Keluar", href: "/stock-out", icon: PackageMinus },
      { label: "Transfer Barang", href: "/transfers", icon: ArrowLeftRight },
      { label: "Adjustment", href: "/stock-adjustments", icon: Settings2 },
    ],
  },
  {
    label: "Laporan",
    items: [
      { label: "Laporan", href: "/reports", icon: ChartBar },
      { label: "Riwayat", href: "/activity-logs", icon: ClipboardList },
    ],
  },
];

const allNavItems = navSections.flatMap((s) => s.items);

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex w-[260px] flex-col border-r border-border bg-sidebar fixed inset-y-0 left-0 z-50">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="9" y1="14" x2="15" y2="14" />
          </svg>
        </div>
        <div>
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">WMS</span>
          <p className="text-[10px] text-text2 -mt-0.5">Warehouse System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-text3 mb-1">
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all mb-0.5",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-text2 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-[18px] w-[18px]", active && "text-primary")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-border px-3 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-sm font-bold text-white shrink-0 shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-foreground truncate">
              {user?.name || "Admin Gudang"}
            </div>
            <div className="text-[11px] text-text2">
              {user?.role === "admin" ? "Administrator" : "Staff"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export const mobileNav = allNavItems;
