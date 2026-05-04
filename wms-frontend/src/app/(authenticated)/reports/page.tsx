"use client";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import type { Item, PaginatedResponse, StockIn, StockOut } from "@/types/api";
import { useCallback, useEffect, useState } from "react";

export default function ReportsPage() {
  const [stockItems, setStockItems] = useState<Item[]>([]);
  const [lowStock, setLowStock] = useState<Item[]>([]);
  const [stockInData, setStockInData] = useState<StockIn[]>([]);
  const [stockOutData, setStockOutData] = useState<StockOut[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [stockPage, setStockPage] = useState(1);
  const [stockLastPage, setStockLastPage] = useState(1);

  const fetchStock = useCallback(async () => {
    const res = await api.get<PaginatedResponse<Item>>("/reports/stock", { params: { page: stockPage, per_page: 50 } });
    setStockItems(res.data.data);
    setStockLastPage(res.data.meta.last_page);
  }, [stockPage]);

  const fetchLowStock = useCallback(async () => {
    const res = await api.get("/reports/low-stock");
    setLowStock(res.data.data || res.data);
  }, []);

  const fetchStockIn = useCallback(async () => {
    const params: Record<string, unknown> = { per_page: 50 };
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await api.get("/reports/stock-in", { params });
    setStockInData(res.data.data);
  }, [from, to]);

  const fetchStockOut = useCallback(async () => {
    const params: Record<string, unknown> = { per_page: 50 };
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await api.get("/reports/stock-out", { params });
    setStockOutData(res.data.data);
  }, [from, to]);

  useEffect(() => { fetchStock(); }, [fetchStock]);
  useEffect(() => { fetchLowStock(); }, [fetchLowStock]);
  useEffect(() => { fetchStockIn(); }, [fetchStockIn]);
  useEffect(() => { fetchStockOut(); }, [fetchStockOut]);

  const statusBadge = (status: string) => {
    switch (status) {
      case "habis": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[rgba(248,113,113,0.15)] text-[#f87171] border border-[rgba(248,113,113,0.25)]">Habis</span>;
      case "hampir_habis": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[rgba(251,191,36,0.15)] text-[#fbbf24] border border-[rgba(251,191,36,0.25)]">Hampir Habis</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.25)]">Aman</span>;
    }
  };

  const stockColumns = [
    { key: "code", label: "Kode" },
    { key: "name", label: "Nama" },
    { key: "category", label: "Kategori", render: (i: Item) => i.category?.name || "-" },
    { key: "total_stock", label: "Total Stok" },
    { key: "minimum_stock", label: "Min. Stok" },
    { key: "status", label: "Status", render: (i: Item) => statusBadge(i.status) },
  ];

  return (
    <>
      <PageHeader title="Laporan" description="Generate dan export laporan stok komprehensif" />

      <div className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-border bg-card backdrop-blur-[10px] flex-wrap">
        <Input type="date" className="w-[160px] rounded-[10px]" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span className="text-text2">s/d</span>
        <Input type="date" className="w-[160px] rounded-[10px]" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Stok</TabsTrigger>
          <TabsTrigger value="low">Stok Rendah</TabsTrigger>
          <TabsTrigger value="in">Stok Masuk</TabsTrigger>
          <TabsTrigger value="out">Stok Keluar</TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="mt-4">
          <DataTable columns={stockColumns} data={stockItems} currentPage={stockPage} lastPage={stockLastPage} onPageChange={setStockPage} />
        </TabsContent>
        <TabsContent value="low" className="mt-4">
          <DataTable columns={stockColumns} data={lowStock} />
        </TabsContent>
        <TabsContent value="in" className="mt-4">
          <DataTable
            columns={[
              { key: "date", label: "Tanggal" },
              { key: "item", label: "Barang", render: (r: StockIn) => r.item?.name || "-" },
              { key: "location", label: "Lokasi", render: (r: StockIn) => r.location?.name || "-" },
              { key: "quantity", label: "Qty" },
              { key: "supplier", label: "Supplier" },
            ]}
            data={stockInData}
          />
        </TabsContent>
        <TabsContent value="out" className="mt-4">
          <DataTable
            columns={[
              { key: "date", label: "Tanggal" },
              { key: "item", label: "Barang", render: (r: StockOut) => r.item?.name || "-" },
              { key: "location", label: "Lokasi", render: (r: StockOut) => r.location?.name || "-" },
              { key: "quantity", label: "Qty" },
              { key: "purpose", label: "Tujuan" },
            ]}
            data={stockOutData}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
