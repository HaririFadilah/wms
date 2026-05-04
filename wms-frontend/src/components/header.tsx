"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Bell, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { mobileNav } from "./sidebar";
import { Badge } from "./ui/badge";
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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api
      .get("/notifications/unread-count")
      .then((res) => setUnreadCount(res.data.unread_count))
      .catch(() => {});
  }, [pathname]);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <nav className="flex flex-col gap-1 py-6 px-3">
              {mobileNav.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/notifications" className="relative">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2" />}>
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="hidden sm:inline text-sm">{user?.name}</span>
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
