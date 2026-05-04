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
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import type { Category, PaginatedResponse } from "@/types/api";
import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [data, setData] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const fetch = useCallback(async () => {
    setLoading(true);
    const res = await api.get<PaginatedResponse<Category>>("/categories", {
      params: { page, per_page: 20 },
    });
    setData(res.data.data);
    setLastPage(res.data.meta.last_page);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/categories", form);
      toast.success("Kategori berhasil ditambahkan.");
      setDialogOpen(false);
      setForm({ name: "", description: "" });
      fetch();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosErr.response?.data?.message || "Gagal menyimpan.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus kategori ini?")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Kategori dihapus.");
      fetch();
    } catch {
      toast.error("Gagal menghapus.");
    }
  };

  const columns = [
    { key: "name", label: "Nama" },
    {
      key: "description",
      label: "Deskripsi",
      render: (c: Category) => c.description || "-",
    },
    { key: "items_count", label: "Jumlah Barang" },
    {
      key: "actions",
      label: "",
      render: (c: Category) => (
        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Kategori"
        description="Kelola kategori barang"
        icon={FolderOpen}
      >
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button className="rounded-xl bg-primary text-white hover:bg-green-600 shadow-sm" />}>
              <Plus className="h-4 w-4 mr-2" /> Tambah Kategori
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Kategori</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  Simpan
                </Button>
              </form>
            </DialogContent>
          </Dialog>
      </PageHeader>

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
