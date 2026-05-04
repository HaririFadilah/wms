"use client";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import type { ActivityLog, PaginatedResponse } from "@/types/api";
import { useCallback, useEffect, useState } from "react";

export default function ActivityLogsPage() {
  const [data, setData] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    const params: Record<string, unknown> = { page, per_page: 20 };
    if (action) params.action = action;
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await api.get<PaginatedResponse<ActivityLog>>("/activity-logs", { params });
    setData(res.data.data);
    setLastPage(res.data.meta.last_page);
    setLoading(false);
  }, [page, action, from, to]);

  useEffect(() => { fetch(); }, [fetch]);

  const actionColor = (a: string) => {
    if (a.includes("in")) return "bg-green-500";
    if (a.includes("out")) return "bg-red-500";
    if (a.includes("transfer")) return "bg-blue-500";
    if (a.includes("adjustment")) return "bg-amber-500";
    return "bg-gray-500";
  };

  const columns = [
    {
      key: "created_at", label: "Waktu",
      render: (r: ActivityLog) => new Date(r.created_at).toLocaleString("id-ID"),
    },
    {
      key: "action", label: "Aksi",
      render: (r: ActivityLog) => <Badge className={actionColor(r.action)}>{r.action}</Badge>,
    },
    { key: "description", label: "Deskripsi" },
    { key: "user", label: "User", render: (r: ActivityLog) => r.user?.name || "-" },
    { key: "ip_address", label: "IP", render: (r: ActivityLog) => r.ip_address || "-" },
    {
      key: "changes", label: "Perubahan",
      render: (r: ActivityLog) => r.changes ? (
        <pre className="text-xs max-w-[200px] overflow-auto">{JSON.stringify(r.changes, null, 1)}</pre>
      ) : "-",
    },
  ];

  return (
    <>
      <PageHeader title="Activity Log" description="Riwayat semua aktivitas" />
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={action || "all"} onValueChange={(v: string | null) => { setAction(!v || v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter aksi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="stock_in">Stok Masuk</SelectItem>
            <SelectItem value="stock_out">Stok Keluar</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="stock_adjustment">Adjustment</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="w-auto" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
        <span className="text-muted-foreground">s/d</span>
        <Input type="date" className="w-auto" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
      </div>
      <DataTable columns={columns} data={data} currentPage={page} lastPage={lastPage} onPageChange={setPage} isLoading={loading} />
    </>
  );
}
