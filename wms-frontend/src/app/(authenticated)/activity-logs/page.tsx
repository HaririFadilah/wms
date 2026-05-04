"use client";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import type { ActivityLog, PaginatedResponse } from "@/types/api";
import { ClipboardList } from "lucide-react";
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
    if (a.includes("in")) return "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900";
    if (a.includes("out")) return "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900";
    if (a.includes("transfer")) return "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900";
    if (a.includes("adjustment")) return "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900";
    return "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900";
  };

  const columns = [
    {
      key: "created_at", label: "Waktu",
      render: (r: ActivityLog) => (
        <span className="text-[11px] text-text3">{new Date(r.created_at).toLocaleString("id-ID")}</span>
      ),
    },
    {
      key: "action", label: "Aksi",
      render: (r: ActivityLog) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${actionColor(r.action)}`}>
          {r.action}
        </span>
      ),
    },
    { key: "description", label: "Deskripsi" },
    { key: "user", label: "User", render: (r: ActivityLog) => r.user?.name || "-" },
    { key: "ip_address", label: "IP", render: (r: ActivityLog) => r.ip_address || "-" },
    {
      key: "changes", label: "Perubahan",
      render: (r: ActivityLog) => r.changes ? (
        <pre className="text-xs max-w-[200px] overflow-auto text-text3">{JSON.stringify(r.changes, null, 1)}</pre>
      ) : "-",
    },
  ];

  return (
    <>
      <PageHeader title="Riwayat Aktivitas" description="Log semua aktivitas transaksi dan perubahan data" icon={ClipboardList} />
      <div className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-border bg-card shadow-sm flex-wrap">
        <Select value={action || "all"} onValueChange={(v: string | null) => { setAction(!v || v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[170px] rounded-xl"><SelectValue placeholder="Semua Aktivitas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Aktivitas</SelectItem>
            <SelectItem value="stock_in">Stok Masuk</SelectItem>
            <SelectItem value="stock_out">Stok Keluar</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="stock_adjustment">Adjustment</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="w-[160px] rounded-xl" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
        <Input type="date" className="w-[160px] rounded-xl" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
      </div>
      <DataTable columns={columns} data={data} currentPage={page} lastPage={lastPage} onPageChange={setPage} isLoading={loading} />
    </>
  );
}
