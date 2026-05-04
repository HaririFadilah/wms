"use client";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";

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
      case "habis": return <Badge variant="destructive">Habis</Badge>;
      case "hampir_habis": return <Badge className="bg-amber-500">Hampir Habis</Badge>;
      default: return <Badge className="bg-green-500">Aman</Badge>;
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
      <PageHeader title="Laporan" description="Ringkasan laporan warehouse" />

      <div className="flex items-center gap-2">
        <Input type="date" className="w-auto" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span className="text-muted-foreground">s/d</span>
        <Input type="date" className="w-auto" value={to} onChange={(e) => setTo(e.target.value)} />
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
