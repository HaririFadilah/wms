"use client";


import api from "@/lib/api";
import type { DashboardData } from "@/types/api";
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Box,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FolderOpen,
  LayoutDashboard,
  MapPin,
  PackagePlus,
  TrendingUp,
  Wifi,
  XCircle,
} from "lucide-react";
import Link from "next/link";
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
import { motion } from "framer-motion";

const DONUT_COLORS = ["#16a34a", "#84cc16", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <div className="animate-pulse text-sm">Memuat dashboard...</div>
      </div>
    );
  }

  const stats = [
    { label: "Total Barang", value: data.stats.total_items, icon: Box, color: "#3b82f6", bg: "#eff6ff", badge: "Keseluruhan", badgeIcon: TrendingUp },
    { label: "Kategori", value: data.stats.total_categories, icon: FolderOpen, color: "#22c55e", bg: "#f0fdf4", badge: "Aktif", badgeIcon: ArrowUpRight },
    { label: "Lokasi", value: data.stats.total_locations, icon: MapPin, color: "#8b5cf6", bg: "#f5f3ff", badge: "Tersebar", badgeIcon: MapPin },
    { label: "Total Stok", value: data.stats.total_stock, icon: BarChart3, color: "#06b6d4", bg: "#ecfeff", badge: "Tersedia", badgeIcon: BarChart3 },
    { label: "Stok Rendah", value: data.stats.low_stock, icon: AlertTriangle, color: "#f59e0b", bg: "#fffbeb", badge: "Perlu perhatian", badgeIcon: TrendingUp },
    { label: "Stok Habis", value: data.stats.out_of_stock, icon: XCircle, color: "#ef4444", bg: "#fef2f2", badge: "Kosong", badgeIcon: XCircle },
  ];

  const barData = data.stock_flow.labels.map((label, i) => ({
    month: label,
    Masuk: data.stock_flow.in[i],
    Keluar: data.stock_flow.out[i],
  }));

  const totalIn = data.stock_flow.in.reduce((a, b) => a + b, 0);
  const totalOut = data.stock_flow.out.reduce((a, b) => a + b, 0);
  const selisih = totalIn - totalOut;

  const totalStock = data.location_distribution.reduce((a, b) => a + b.total_stock, 0);
  const pieData = data.location_distribution.map((loc) => ({
    name: loc.name,
    value: loc.total_stock,
    pct: totalStock > 0 ? ((loc.total_stock / totalStock) * 100).toFixed(1) : "0",
  }));
  const topLocation = pieData.length > 0 ? pieData.reduce((a, b) => (a.value > b.value ? a : b)) : null;

  return (
    <>
      {/* Dashboard Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-sm text-text2">Ringkasan data warehouse</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 mt-2 sm:mt-0">
          <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors shadow-sm">
            <svg className="h-4 w-4 text-text2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            Hari ini
            <ChevronRight className="h-3.5 w-3.5 text-text3 rotate-90" />
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors shadow-sm">
            <Download className="h-4 w-4" />
            Ekspor Laporan
          </button>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="relative -mt-2">
        <div className="absolute inset-0 h-32 bg-gradient-to-r from-primary/5 via-transparent to-primary/3 rounded-3xl -z-10 blur-2xl" />
      </div>

      {/* 6 Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm cursor-pointer group"
          >
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: s.color }} />
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full mb-3" style={{ backgroundColor: s.bg }}>
                <s.icon className="h-6 w-6" style={{ color: s.color }} />
              </div>
              <div className="font-heading text-3xl font-bold text-foreground leading-none mb-1">{s.value}</div>
              <div className="text-xs text-text2 font-medium mb-2.5">{s.label}</div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
                <s.badgeIcon className="h-3 w-3" /> {s.badge}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Arus Stok Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Arus Stok</h2>
                <p className="text-xs text-text2">Tren stok masuk dan keluar dalam 6 bulan terakhir</p>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-xs text-text2 hover:bg-muted transition-colors mt-2 sm:mt-0">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              6 Bulan Terakhir
              <ChevronRight className="h-3 w-3 rotate-90" />
            </button>
          </div>

          {/* Summary mini-cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
                  <Download className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-xs text-text2">Total Masuk</span>
              </div>
              <div className="font-heading text-2xl font-bold text-green-600">{totalIn}</div>
            </div>
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50">
                  <ArrowUpRight className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-xs text-text2">Total Keluar</span>
              </div>
              <div className="font-heading text-2xl font-bold text-red-500">{totalOut}</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/50 p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs text-text2">Selisih</span>
              </div>
              <div className="font-heading text-2xl font-bold text-primary">+{selisih}</div>
            </div>
          </div>

          {/* Bar Chart */}
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--text2)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--text2)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  fontSize: "13px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
              <Bar dataKey="Keluar" fill="#ef4444" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Masuk" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Insight strip */}
          <div className="flex items-center justify-between mt-4 p-3.5 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary">Insight</p>
                <p className="text-xs text-text2">Pergerakan stok tertinggi terjadi pada {barData[barData.length - 1]?.month} dengan {totalIn} barang masuk dan {totalOut} barang keluar.</p>
              </div>
            </div>
            <Link href="/reports" className="hidden sm:flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
              Lihat Detail Arus Stok <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Distribusi per Lokasi */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Distribusi per Lokasi</h2>
                <p className="text-xs text-text2">Ringkasan jumlah stok berdasarkan lokasi penyimpanan</p>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-xs text-text2 hover:bg-muted transition-colors mt-2 sm:mt-0">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              6 Bulan Terakhir
              <ChevronRight className="h-3 w-3 rotate-90" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Donut Chart */}
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={2}
                    label={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-border bg-card p-3 shadow-lg text-sm">
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
                              {d.name}
                            </div>
                            <div className="text-lg font-heading font-bold text-primary mt-0.5">{d.value}</div>
                            <div className="text-xs text-text2">{d.pct}% dari total stok</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <text x="50%" y="46%" textAnchor="middle" className="fill-text2 text-xs">Total Stok</text>
                  <text x="50%" y="58%" textAnchor="middle" className="fill-foreground font-heading text-2xl font-bold">{totalStock}</text>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Location Legend List */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-text3 px-2 pb-2 border-b border-border">
                <span>Lokasi</span>
                <span>Stok</span>
              </div>
              <div className="divide-y divide-border">
                {pieData.map((loc, i) => (
                  <div key={loc.name} className="flex items-center justify-between py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${DONUT_COLORS[i % DONUT_COLORS.length]}15` }}>
                        <MapPin className="h-4 w-4" style={{ color: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">{loc.name}</span>
                        <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded-md bg-muted text-text2 font-medium">{loc.pct}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-sm font-bold text-foreground">{loc.value}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-text3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insight strip */}
          {topLocation && (
            <div className="flex items-center justify-between mt-4 p-3.5 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary">Insight</p>
                  <p className="text-xs text-text2">{topLocation.name} menampung {topLocation.pct}% dari total stok. Pertimbangkan optimasi kapasitas.</p>
                </div>
              </div>
              <Link href="/locations" className="hidden sm:flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap">
                Lihat Detail per Lokasi <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* Bottom: Stok Rendah + Transfer Terbaru */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Stok Rendah */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/30">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Stok Rendah</h2>
                  <p className="text-xs text-text2">Item dengan stok kritis yang perlu segera diisi ulang.</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                <BarChart3 className="h-3 w-3" /> {data.stock_alerts.length} item
              </span>
            </div>

            {data.stock_alerts.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">Semua stok aman.</div>
            ) : (
              <div className="space-y-3">
                {data.stock_alerts.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${
                      item.status === "habis"
                        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                        : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900"
                    }`}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${
                      item.status === "habis" ? "bg-red-100 dark:bg-red-900/30" : "bg-orange-100 dark:bg-orange-900/30"
                    }`}>
                      <Box className={`h-5 w-5 ${item.status === "habis" ? "text-red-500" : "text-orange-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-text2">{item.code}</p>
                      <p className="text-xs mt-0.5">
                        <Wifi className="inline h-3 w-3 mr-1 text-text3" />
                        Stok: <span className={item.status === "habis" ? "text-red-500 font-semibold" : "text-orange-500 font-semibold"}>{item.total_stock} {item.unit}</span>
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                      item.status === "habis"
                        ? "text-red-600 dark:text-red-400"
                        : "text-orange-600 dark:text-orange-400"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${item.status === "habis" ? "bg-red-500" : "bg-orange-500"}`} />
                      {item.status === "habis" ? "Habis" : "Hampir Habis"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Footer insight */}
            <div className="flex items-center gap-3 mt-4 p-3.5 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary">Perlu Tindakan</p>
                <p className="text-xs text-text2">{data.stock_alerts.length} item membutuhkan pengisian stok segera untuk mencegah gangguan operasional.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transfer Terbaru */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5 }}>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <ArrowLeftRight className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Transfer Terbaru</h2>
                  <p className="text-xs text-text2">Aktivitas perpindahan stok terbaru di gudang.</p>
                </div>
              </div>
              <Link href="/transfers" className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors">
                Lihat semua <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {data.recent_transfers.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground py-8">Belum ada transfer.</div>
            ) : (
              <div className="space-y-3 flex-1">
                {data.recent_transfers.slice(0, 3).map((t) => (
                  <div key={t.id} className="p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                          <PackagePlus className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{t.item?.name}</p>
                          <p className="text-xs text-text2">
                            {t.from_location?.name} <span className="mx-1">&rarr;</span> {t.to_location?.name}
                          </p>
                        </div>
                      </div>
                      <span className="font-heading text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                        {t.quantity} unit
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text2">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" /> Selesai
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(t.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer link */}
            <div className="border-t border-border pt-4 mt-4">
              <Link href="/transfers" className="flex items-center justify-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <ClipboardList className="h-4 w-4" /> Lihat semua transfer <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

function ClipboardList(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />
    </svg>
  );
}
