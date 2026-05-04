"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import type { Notification, PaginatedResponse } from "@/types/api";
import { AlertTriangle, Bell, CheckCheck, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [data, setData] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetch = useCallback(async () => {
    const res = await api.get<PaginatedResponse<Notification>>("/notifications", { params: { page, per_page: 20 } });
    setData(res.data.data);
    setLastPage(res.data.meta.last_page);
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const markRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
    fetch();
  };

  const readAll = async () => {
    await api.post("/notifications/read-all");
    toast.success("Semua notifikasi ditandai dibaca.");
    fetch();
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "danger": return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-[#fbbf24]" />;
      default: return <Bell className="h-4 w-4 text-[#60a5fa]" />;
    }
  };

  const typeIconBg = (type: string) => {
    switch (type) {
      case "danger": return "bg-red-50 dark:bg-red-950/20";
      case "warning": return "bg-orange-50 dark:bg-orange-950/20";
      default: return "bg-blue-50 dark:bg-blue-950/20";
    }
  };

  return (
    <>
      <PageHeader
        title="Notifikasi"
        description={`${data.filter(n => !n.is_read).length} notifikasi belum dibaca`}
        icon={Bell}
      >
          <Button variant="outline" onClick={readAll} className="rounded-xl">
            <CheckCheck className="h-4 w-4 mr-2" /> Tandai Semua Dibaca
          </Button>
      </PageHeader>
      <div className="space-y-2">
        {data.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card shadow-sm p-12 text-center text-muted-foreground">
            Tidak ada notifikasi.
          </div>
        ) : (
          data.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors cursor-pointer ${
                !n.is_read
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                  : "bg-card border-border hover:bg-muted/50"
              }`}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${typeIconBg(n.type)}`}>
                {typeIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-foreground leading-snug">{n.title}</p>
                  {!n.is_read && (
                    <span className="h-[7px] w-[7px] rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-[13px] text-text2 mt-0.5">{n.message}</p>
                <p className="text-[11px] text-text3 mt-1">
                  {new Date(n.created_at).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-xl">Sebelumnya</Button>
          <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage(page + 1)} className="rounded-xl">Selanjutnya</Button>
        </div>
      )}
    </>
  );
}
