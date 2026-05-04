"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import type { Notification, PaginatedResponse } from "@/types/api";
import { Bell, CheckCheck } from "lucide-react";
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

  const typeColor = (type: string) => {
    switch (type) {
      case "danger": return "destructive" as const;
      case "warning": return "secondary" as const;
      default: return "default" as const;
    }
  };

  return (
    <>
      <PageHeader
        title="Notifikasi"
        description="Pemberitahuan sistem"
        actions={
          <Button variant="outline" onClick={readAll}>
            <CheckCheck className="h-4 w-4 mr-2" /> Tandai Semua Dibaca
          </Button>
        }
      />
      <div className="space-y-3">
        {data.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Tidak ada notifikasi.</CardContent></Card>
        ) : (
          data.map((n) => (
            <Card
              key={n.id}
              className={`cursor-pointer transition-colors ${!n.is_read ? "border-primary/30 bg-primary/5" : ""}`}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <CardContent className="flex items-start gap-3 py-4">
                <Bell className={`h-5 w-5 mt-0.5 ${n.type === "danger" ? "text-red-500" : n.type === "warning" ? "text-amber-500" : "text-blue-500"}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{n.title}</p>
                    <Badge variant={typeColor(n.type)} className="text-[10px]">
                      {n.type}
                    </Badge>
                    {!n.is_read && <Badge variant="outline" className="text-[10px]">Baru</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
          <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>Selanjutnya</Button>
        </div>
      )}
    </>
  );
}
