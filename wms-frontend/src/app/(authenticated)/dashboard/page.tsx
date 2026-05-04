"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import type { DashboardData } from "@/types/api";
import {
  AlertTriangle,
  ArrowLeftRight,
  Box,
  FolderOpen,
  MapPin,
  PackageMinus,
  PackagePlus,
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
      color: "text-blue-600",
    },
    {
      label: "Kategori",
      value: data.stats.total_categories,
      icon: FolderOpen,
      color: "text-green-600",
    },
    {
      label: "Lokasi",
      value: data.stats.total_locations,
      icon: MapPin,
      color: "text-purple-600",
    },
    {
      label: "Total Stok",
      value: data.stats.total_stock,
      icon: PackagePlus,
      color: "text-cyan-600",
    },
    {
      label: "Stok Rendah",
      value: data.stats.low_stock,
      icon: AlertTriangle,
      color: "text-amber-600",
    },
    {
      label: "Stok Habis",
      value: data.stats.out_of_stock,
      icon: PackageMinus,
      color: "text-red-600",
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
        description="Ringkasan data warehouse"
      />

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Arus Stok (6 Bulan)</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribusi per Lokasi</CardTitle>
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Stok Rendah
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
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.code} &middot; Stok: {item.total_stock}{" "}
                        {item.unit}
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.status === "habis" ? "destructive" : "secondary"
                      }
                    >
                      {item.status === "habis" ? "Habis" : "Hampir Habis"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
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
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {t.item?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.from_location?.name} &rarr; {t.to_location?.name}
                      </p>
                    </div>
                    <Badge variant="outline">{t.quantity} unit</Badge>
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
