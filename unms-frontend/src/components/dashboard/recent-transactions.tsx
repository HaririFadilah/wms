import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { formatCurrency } from '@/lib/format';
import type { InvoiceStatus, RecentTransaction } from '@/data/dashboard.dummy';

const statusToTone: Record<InvoiceStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  Lunas: 'success',
  'Belum Lunas': 'warning',
  Terlambat: 'danger',
  Dibatalkan: 'neutral',
};

interface Props {
  rows: ReadonlyArray<RecentTransaction>;
}

export function RecentTransactions({ rows }: Props) {
  return (
    <Card className="p-0 gap-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold">Transaksi Terbaru</h3>
        <button
          type="button"
          className="text-xs font-medium text-primary hover:underline"
        >
          Lihat Semua
        </button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="text-xs">Tanggal</TableHead>
              <TableHead className="text-xs">No. Invoice</TableHead>
              <TableHead className="text-xs">Pelanggan</TableHead>
              <TableHead className="text-xs">Deskripsi</TableHead>
              <TableHead className="text-xs text-right">Jumlah</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.invoiceNo} className="text-sm">
                <TableCell className="whitespace-nowrap text-muted-foreground">{r.date}</TableCell>
                <TableCell className="font-medium text-foreground">{r.invoiceNo}</TableCell>
                <TableCell>{r.customer}</TableCell>
                <TableCell className="text-muted-foreground">{r.description}</TableCell>
                <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">
                  {formatCurrency(r.amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge label={r.status} tone={statusToTone[r.status]} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
