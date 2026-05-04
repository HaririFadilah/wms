"use client";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
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
import type { Item, Location, PaginatedResponse, StockTransfer } from "@/types/api";
import { ArrowLeftRight, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function TransfersPage() {
  const [data, setData] = useState<StockTransfer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ item_id: "", from_location_id: "", to_location_id: "", quantity: "", note: "" });

  const fetch = useCallback(async () => {
    setLoading(true);
    const res = await api.get<PaginatedResponse<StockTransfer>>("/transfers", { params: { page, per_page: 20 } });
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
      await api.post("/transfers", {
        item_id: Number(form.item_id), from_location_id: Number(form.from_location_id),
        to_location_id: Number(form.to_location_id), quantity: Number(form.quantity), note: form.note || null,
      });
      toast.success("Transfer berhasil.");
      setDialogOpen(false);
      setForm({ item_id: "", from_location_id: "", to_location_id: "", quantity: "", note: "" });
      fetch();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Gagal menyimpan.");
    }
  };

  const columns = [
    { key: "item", label: "Barang", render: (r: StockTransfer) => r.item?.name || "-" },
    { key: "from_location", label: "Dari", render: (r: StockTransfer) => r.from_location?.name || "-" },
    { key: "to_location", label: "Ke", render: (r: StockTransfer) => r.to_location?.name || "-" },
    { key: "quantity", label: "Qty" },
    { key: "user", label: "User", render: (r: StockTransfer) => r.user?.name || "-" },
    { key: "note", label: "Catatan", render: (r: StockTransfer) => r.note || "-" },
    { key: "created_at", label: "Tanggal", render: (r: StockTransfer) => new Date(r.created_at).toLocaleDateString("id-ID") },
  ];

  return (
    <>
      <PageHeader title="Transfer" description="Riwayat transfer antar lokasi" icon={ArrowLeftRight}>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="rounded-xl bg-primary text-white hover:bg-green-600 shadow-sm" />}><Plus className="h-4 w-4 mr-2" /> Transfer Baru</DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Transfer Stok</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Barang</Label>
                <Select value={form.item_id} onValueChange={(v: string | null) => setForm({ ...form, item_id: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Pilih barang" /></SelectTrigger>
                  <SelectContent>{items.map((i) => (<SelectItem key={i.id} value={String(i.id)}>{i.code} - {i.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dari Lokasi</Label>
                  <Select value={form.from_location_id} onValueChange={(v: string | null) => setForm({ ...form, from_location_id: v ?? "" })}>
                    <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>{locations.map((l) => (<SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ke Lokasi</Label>
                  <Select value={form.to_location_id} onValueChange={(v: string | null) => setForm({ ...form, to_location_id: v ?? "" })}>
                    <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>{locations.map((l) => (<SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Jumlah</Label>
                <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} min="1" required />
              </div>
              <div className="space-y-2">
                <Label>Catatan</Label>
                <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">Simpan</Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <DataTable columns={columns} data={data} currentPage={page} lastPage={lastPage} onPageChange={setPage} isLoading={loading} />
    </>
  );
}
