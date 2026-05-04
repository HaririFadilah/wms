"use client";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
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
    if (a.includes("in")) return "bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.25)]";
    if (a.includes("out")) return "bg-[rgba(248,113,113,0.15)] text-destructive border border-[rgba(248,113,113,0.25)]";
    if (a.includes("transfer")) return "bg-[rgba(96,165,250,0.15)] text-[#60a5fa] border border-[rgba(96,165,250,0.25)]";
    if (a.includes("adjustment")) return "bg-[rgba(251,191,36,0.15)] text-[#fbbf24] border border-[rgba(251,191,36,0.25)]";
    return "bg-[rgba(167,139,250,0.15)] text-[#a78bfa] border border-[rgba(167,139,250,0.25)]";
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
      <PageHeader title="Riwayat Aktivitas" description="Log semua aktivitas transaksi dan perubahan data" />
      <div className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-border bg-card backdrop-blur-[10px] flex-wrap">
        <Select value={action || "all"} onValueChange={(v: string | null) => { setAction(!v || v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[170px] rounded-[10px]"><SelectValue placeholder="Semua Aktivitas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Aktivitas</SelectItem>
            <SelectItem value="stock_in">Stok Masuk</SelectItem>
            <SelectItem value="stock_out">Stok Keluar</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="stock_adjustment">Adjustment</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="w-[160px] rounded-[10px]" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
        <Input type="date" className="w-[160px] rounded-[10px]" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
      </div>
      <DataTable columns={columns} data={data} currentPage={page} lastPage={lastPage} onPageChange={setPage} isLoading={loading} />
    </>
  );
}
