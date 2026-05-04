"use client";

import { cn } from "@/lib/utils";
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

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Barang", href: "/items", icon: Box },
  { label: "Kategori", href: "/categories", icon: FolderOpen },
  { label: "Lokasi", href: "/locations", icon: MapPin },
  { label: "Stok Masuk", href: "/stock-in", icon: PackagePlus },
  { label: "Stok Keluar", href: "/stock-out", icon: PackageMinus },
  { label: "Transfer", href: "/transfers", icon: ArrowLeftRight },
  { label: "Adjustment", href: "/stock-adjustments", icon: Settings2 },
  { label: "Laporan", href: "/reports", icon: ChartBar },
  { label: "Notifikasi", href: "/notifications", icon: Bell },
  { label: "Activity Log", href: "/activity-logs", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center gap-2 border-b px-6 font-bold text-lg">
        <Box className="h-6 w-6 text-primary" />
        WMS Enterprise
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export const mobileNav = nav;
