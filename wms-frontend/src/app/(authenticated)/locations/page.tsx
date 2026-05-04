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
import type { Location, PaginatedResponse } from "@/types/api";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function LocationsPage() {
  const [data, setData] = useState<Location[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const fetch = useCallback(async () => {
    setLoading(true);
    const res = await api.get<PaginatedResponse<Location>>("/locations", {
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
      await api.post("/locations", form);
      toast.success("Lokasi berhasil ditambahkan.");
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
    if (!confirm("Hapus lokasi ini?")) return;
    try {
      await api.delete(`/locations/${id}`);
      toast.success("Lokasi dihapus.");
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
      render: (l: Location) => l.description || "-",
    },
    { key: "total_stock", label: "Total Stok" },
    {
      key: "actions",
      label: "",
      render: (l: Location) => (
        <Button variant="ghost" size="icon" onClick={() => handleDelete(l.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Lokasi"
        description="Kelola lokasi gudang"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="h-4 w-4 mr-2" /> Tambah Lokasi
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Lokasi</DialogTitle>
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
        }
      />

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
