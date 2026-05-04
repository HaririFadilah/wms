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
import api from "@/lib/api";
import type { Category, Item, PaginatedResponse } from "@/types/api";
import { Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const statusBadge = (status: string) => {
  switch (status) {
    case "habis":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[rgba(248,113,113,0.15)] text-[#f87171] border border-[rgba(248,113,113,0.25)]">Habis</span>;
    case "hampir_habis":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[rgba(251,191,36,0.15)] text-[#fbbf24] border border-[rgba(251,191,36,0.25)]">Hampir Habis</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.25)]">Aman</span>;
  }
};

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    unit: "",
    minimum_stock: "0",
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await api.get<PaginatedResponse<Item>>("/items", {
      params: { page, search, per_page: 20 },
    });
    setItems(res.data.data);
    setLastPage(res.data.meta.last_page);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    api.get("/categories", { params: { per_page: 100 } }).then((res) => {
      setCategories(res.data.data);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/items", {
        ...form,
        category_id: Number(form.category_id),
        minimum_stock: Number(form.minimum_stock),
      });
      toast.success("Barang berhasil ditambahkan.");
      setDialogOpen(false);
      setForm({ name: "", category_id: "", unit: "", minimum_stock: "0" });
      fetchItems();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosErr.response?.data?.message || "Gagal menyimpan.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus barang ini?")) return;
    try {
      await api.delete(`/items/${id}`);
      toast.success("Barang dihapus.");
      fetchItems();
    } catch {
      toast.error("Gagal menghapus.");
    }
  };

  const columns = [
    { key: "code", label: "Kode" },
    { key: "name", label: "Nama" },
    {
      key: "category",
      label: "Kategori",
      render: (item: Item) => item.category?.name || "-",
    },
    { key: "unit", label: "Satuan" },
    { key: "total_stock", label: "Stok Total" },
    { key: "minimum_stock", label: "Min. Stok" },
    {
      key: "status",
      label: "Status",
      render: (item: Item) => statusBadge(item.status),
    },
    {
      key: "actions",
      label: "",
      render: (item: Item) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDelete(item.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Barang"
        description="Daftar semua barang di warehouse"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="h-4 w-4 mr-2" /> Tambah Barang
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Barang</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Barang</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={form.category_id}
                    onValueChange={(v: string | null) =>
                      setForm({ ...form, category_id: v ?? "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Satuan</Label>
                    <Input
                      value={form.unit}
                      onChange={(e) =>
                        setForm({ ...form, unit: e.target.value })
                      }
                      placeholder="pcs, meter, kg..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Min. Stok</Label>
                    <Input
                      type="number"
                      value={form.minimum_stock}
                      onChange={(e) =>
                        setForm({ ...form, minimum_stock: e.target.value })
                      }
                      min="0"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Simpan
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-border bg-card backdrop-blur-[10px] flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text3" />
          <Input
            placeholder="Cari nama / kode barang..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 w-[220px] rounded-[10px]"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        currentPage={page}
        lastPage={lastPage}
        onPageChange={setPage}
        isLoading={loading}
      />
    </>
  );
}
