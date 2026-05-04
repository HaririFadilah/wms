"use client";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import type { Item, Location, PaginatedResponse, StockAdjustment } from "@/types/api";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function StockAdjustmentsPage() {
  const [data, setData] = useState<StockAdjustment[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ item_id: "", location_id: "", type: "set", quantity: "", reason: "", note: "" });

  const fetch = useCallback(async () => {
    setLoading(true);
    const res = await api.get<PaginatedResponse<StockAdjustment>>("/stock-adjustments", { params: { page, per_page: 20 } });
    setData(res.data.data);
    setLastPage(res.data.meta.last_page);
    setLoading(false);
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => {
    api.get("/items", { params: { per_page: 200 } }).then((res) => setItems(res.data.data));
    api.get("/locations", { params: { per_page: 200 } }).then((res) => setLocations(res.data.data));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/stock-adjustments", {
        item_id: Number(form.item_id), location_id: Number(form.location_id),
        type: form.type, quantity: Number(form.quantity), reason: form.reason, note: form.note || null,
      });
      toast.success("Adjustment berhasil.");
      setDialogOpen(false);
      setForm({ item_id: "", location_id: "", type: "set", quantity: "", reason: "", note: "" });
      fetch();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Gagal menyimpan.");
    }
  };

  const typeLabel = (t: string) => {
    switch (t) {
      case "set": return <Badge>Set</Badge>;
      case "add": return <Badge className="bg-green-500">Add</Badge>;
      case "subtract": return <Badge variant="destructive">Subtract</Badge>;
      default: return t;
    }
  };

  const columns = [
    { key: "item", label: "Barang", render: (r: StockAdjustment) => r.item?.name || "-" },
    { key: "location", label: "Lokasi", render: (r: StockAdjustment) => r.location?.name || "-" },
    { key: "type", label: "Tipe", render: (r: StockAdjustment) => typeLabel(r.type) },
    { key: "old_quantity", label: "Stok Lama" },
    { key: "new_quantity", label: "Stok Baru" },
    { key: "reason", label: "Alasan" },
    { key: "user", label: "User", render: (r: StockAdjustment) => r.user?.name || "-" },
    { key: "created_at", label: "Tanggal", render: (r: StockAdjustment) => new Date(r.created_at).toLocaleDateString("id-ID") },
  ];

  return (
    <>
      <PageHeader title="Stock Adjustment" description="Penyesuaian stok manual" actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}><Plus className="h-4 w-4 mr-2" /> Adjustment Baru</DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Stock Adjustment</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Barang</Label>
                <Select value={form.item_id} onValueChange={(v: string | null) => setForm({ ...form, item_id: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Pilih barang" /></SelectTrigger>
                  <SelectContent>{items.map((i) => (<SelectItem key={i.id} value={String(i.id)}>{i.code} - {i.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lokasi</Label>
                <Select value={form.location_id} onValueChange={(v: string | null) => setForm({ ...form, location_id: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Pilih lokasi" /></SelectTrigger>
                  <SelectContent>{locations.map((l) => (<SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipe</Label>
                  <Select value={form.type} onValueChange={(v: string | null) => setForm({ ...form, type: v ?? "" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="set">Set (tetapkan)</SelectItem>
                      <SelectItem value="add">Add (tambah)</SelectItem>
                      <SelectItem value="subtract">Subtract (kurangi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Jumlah</Label>
                  <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} min="0" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alasan</Label>
                <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Stock opname, koreksi data, dll." required />
              </div>
              <div className="space-y-2">
                <Label>Catatan</Label>
                <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">Simpan</Button>
            </form>
          </DialogContent>
        </Dialog>
      } />
      <DataTable columns={columns} data={data} currentPage={page} lastPage={lastPage} onPageChange={setPage} isLoading={loading} />
    </>
  );
}
