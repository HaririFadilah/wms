"use client";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import type { Item, Location, PaginatedResponse, StockIn } from "@/types/api";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function StockInPage() {
  const [data, setData] = useState<StockIn[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [form, setForm] = useState({
    item_id: "",
    location_id: "",
    quantity: "",
    supplier: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    const params: Record<string, unknown> = { page, per_page: 20 };
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await api.get<PaginatedResponse<StockIn>>("/stock-ins", {
      params,
    });
    setData(res.data.data);
    setLastPage(res.data.meta.last_page);
    setLoading(false);
  }, [page, from, to]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    api
      .get("/items", { params: { per_page: 200 } })
      .then((res) => setItems(res.data.data));
    api
      .get("/locations", { params: { per_page: 200 } })
      .then((res) => setLocations(res.data.data));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/stock-ins", {
        ...form,
        item_id: Number(form.item_id),
        location_id: Number(form.location_id),
        quantity: Number(form.quantity),
      });
      toast.success("Stok masuk berhasil disimpan.");
      setDialogOpen(false);
      setForm({
        item_id: "",
        location_id: "",
        quantity: "",
        supplier: "",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
      fetch();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosErr.response?.data?.message || "Gagal menyimpan.");
    }
  };

  const columns = [
    {
      key: "date",
      label: "Tanggal",
    },
    {
      key: "item",
      label: "Barang",
      render: (r: StockIn) => r.item?.name || "-",
    },
    {
      key: "location",
      label: "Lokasi",
      render: (r: StockIn) => r.location?.name || "-",
    },
    { key: "quantity", label: "Qty" },
    { key: "supplier", label: "Supplier" },
    {
      key: "user",
      label: "User",
      render: (r: StockIn) => r.user?.name || "-",
    },
    {
      key: "note",
      label: "Catatan",
      render: (r: StockIn) => r.note || "-",
    },
  ];

  return (
    <>
      <PageHeader
        title="Stok Masuk"
        description="Riwayat barang masuk"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="h-4 w-4 mr-2" /> Tambah Stok Masuk
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stok Masuk Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Barang</Label>
                  <Select
                    value={form.item_id}
                    onValueChange={(v: string | null) => setForm({ ...form, item_id: v ?? "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih barang" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((i) => (
                        <SelectItem key={i.id} value={String(i.id)}>
                          {i.code} - {i.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lokasi</Label>
                  <Select
                    value={form.location_id}
                    onValueChange={(v: string | null) => setForm({ ...form, location_id: v ?? "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih lokasi" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l.id} value={String(l.id)}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jumlah</Label>
                    <Input
                      type="number"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                      }
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Input
                    value={form.supplier}
                    onChange={(e) =>
                      setForm({ ...form, supplier: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catatan</Label>
                  <Textarea
                    value={form.note}
                    onChange={(e) =>
                      setForm({ ...form, note: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  Simpan
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex items-center gap-2">
        <Input
          type="date"
          className="w-auto"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setPage(1);
          }}
        />
        <span className="text-muted-foreground">s/d</span>
        <Input
          type="date"
          className="w-auto"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={data}
        currentPage={page}
        lastPage={lastPage}
        onPageChange={setPage}
        isLoading={loading}
      />
    </>
  );
}
