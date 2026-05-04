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
    <aside className="hidden md:flex w-60 flex-col border-r border-border bg-sidebar fixed inset-y-0 left-0 z-50">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-primary-foreground">
            <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm-9 9H7v-4h4v4zm6 0h-4v-4h4v4zM20 7H4V5a2 2 0 012-2h12a2 2 0 012 2v2z" />
          </svg>
        </div>
        <span className="font-heading text-lg font-bold tracking-tight text-foreground">
          W<span className="text-primary">M</span>S
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-2">
            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text3">
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] font-medium transition-all mb-0.5",
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
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-border px-3 py-4">
        <div className="flex items-center gap-2.5 rounded-xl bg-accent p-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-[#2dd4bf] text-[13px] font-bold text-primary-foreground shrink-0">
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
