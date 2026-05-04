"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  currentPage?: number;
  lastPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export function DataTable<T extends { id: number }>({
  columns,
  data,
  currentPage = 1,
  lastPage = 1,
  onPageChange,
  isLoading,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card backdrop-blur-[10px] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className="bg-accent text-[11px] font-semibold uppercase tracking-wider text-text3 h-10 px-4"
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  Tidak ada data.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="border-b border-border hover:bg-accent transition-colors">
                  {columns.map((col) => (
                    <TableCell key={col.key} className="px-4 py-3 text-[13.5px]">
                      {col.render
                        ? col.render(item)
                        : (item as Record<string, unknown>)[col.key] as string}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {lastPage > 1 && onPageChange && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text2">
            Halaman {currentPage} dari {lastPage}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="rounded-[10px]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= lastPage}
              onClick={() => onPageChange(currentPage + 1)}
              className="rounded-[10px]"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
