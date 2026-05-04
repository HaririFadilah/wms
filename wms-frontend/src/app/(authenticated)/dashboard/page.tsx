"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import type { DashboardData } from "@/types/api";
import {
  AlertTriangle,
  ArrowLeftRight,
  Box,
  FolderOpen,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Memuat dashboard...
      </div>
    );
  }

  const stats = [
    {
      label: "Total Barang",
      value: data.stats.total_items,
      icon: Box,
      iconColor: "text-primary",
      iconBg: "bg-lime-glow",
      change: `${data.stats.total_items} terdaftar`,
      changeType: "up" as const,
    },
    {
      label: "Total Kategori",
      value: data.stats.total_categories,
      icon: FolderOpen,
      iconColor: "text-[#60a5fa]",
      iconBg: "bg-[rgba(96,165,250,0.1)]",
      change: `${data.stats.total_categories} kategori`,
      changeType: "up" as const,
    },
    {
      label: "Hampir Habis",
      value: data.stats.low_stock,
      icon: AlertTriangle,
      iconColor: "text-[#fbbf24]",
      iconBg: "bg-[rgba(251,191,36,0.1)]",
      change: "Perlu perhatian",
      changeType: "warn" as const,
    },
    {
      label: "Stok Habis",
      value: data.stats.out_of_stock,
      icon: XCircle,
      iconColor: "text-destructive",
      iconBg: "bg-[rgba(248,113,113,0.1)]",
      change: "Segera restok",
      changeType: "down" as const,
    },
  ];

  const barData = data.stock_flow.labels.map((label, i) => ({
    month: label,
    masuk: data.stock_flow.in[i],
    keluar: data.stock_flow.out[i],
  }));

  const pieData = data.location_distribution.map((loc) => ({
    name: loc.name,
    value: loc.total_stock,
  }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Berikut ringkasan aktivitas gudang"
      />

      {/* Stat Cards - 4 column grid matching wms-app.html */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:border-[rgba(255,255,255,0.12)] backdrop-blur-[10px]"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${s.iconBg} mb-3`}>
              <s.icon className={`h-5 w-5 ${s.iconColor}`} />
            </div>
            <div className="text-xs text-text2 font-medium mb-1">{s.label}</div>
            <div className="font-heading text-[26px] font-bold text-foreground leading-tight">{s.value}</div>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full mt-2 ${
              s.changeType === "up"
                ? "bg-[rgba(74,222,128,0.15)] text-[#4ade80]"
                : s.changeType === "warn"
                ? "bg-[rgba(251,191,36,0.15)] text-[#fbbf24]"
                : "bg-[rgba(248,113,113,0.15)] text-destructive"
            }`}>
              {s.changeType === "up" ? "↑" : s.changeType === "warn" ? "⚠" : "↓"} {s.change}
            </span>
          </div>
        ))}
      </div>

      {/* Charts - PRESERVED as-is */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="backdrop-blur-[10px]">
          <CardHeader>
            <CardTitle className="font-heading text-[15px] font-semibold">Arus Stok (6 Bulan)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="masuk" fill="#3b82f6" name="Masuk" />
                <Bar dataKey="keluar" fill="#ef4444" name="Keluar" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-[10px]">
          <CardHeader>
            <CardTitle className="font-heading text-[15px] font-semibold">Distribusi per Lokasi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row - Alerts & Recent Transfers */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="backdrop-blur-[10px]">
          <CardHeader>
            <CardTitle className="font-heading text-[15px] font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#fbbf24]" /> Peringatan Stok
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.stock_alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Semua stok aman.</p>
            ) : (
              <div className="space-y-2">
                {data.stock_alerts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-[10px] border border-border p-3 hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="text-[13.5px] font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-text2">
                        {item.code} &middot; Stok: {item.total_stock}{" "}
                        {item.unit}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      item.status === "habis"
                        ? "bg-[rgba(248,113,113,0.15)] text-destructive border-[rgba(248,113,113,0.25)]"
                        : "bg-[rgba(251,191,36,0.15)] text-[#fbbf24] border-[rgba(251,191,36,0.25)]"
                    }`}>
                      {item.status === "habis" ? "Habis" : "Hampir Habis"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-[10px]">
          <CardHeader>
            <CardTitle className="font-heading text-[15px] font-semibold flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" /> Transfer Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recent_transfers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada transfer.</p>
            ) : (
              <div className="space-y-2">
                {data.recent_transfers.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-[10px] border border-border p-3 hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="text-[13.5px] font-medium text-foreground">
                        {t.item?.name}
                      </p>
                      <p className="text-xs text-text2">
                        {t.from_location?.name} &rarr; {t.to_location?.name}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[rgba(163,230,53,0.15)] text-primary border border-[rgba(163,230,53,0.25)]">
                      {t.quantity} unit
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
