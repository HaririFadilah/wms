import { Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { OverdueRow } from '@/data/dashboard.dummy';
import { cn } from '@/lib/utils';

interface Props {
  rows: ReadonlyArray<OverdueRow>;
}

function progressColor(pct: number): string {
  if (pct >= 80) return 'bg-rose-500';
  if (pct >= 60) return 'bg-orange-500';
  if (pct >= 40) return 'bg-amber-500';
  if (pct >= 25) return 'bg-emerald-500';
  return 'bg-emerald-400';
}

export function TopOverdue({ rows }: Props) {
  return (
    <Card className="p-0 gap-0 overflow-hidden">
      <div className="flex items-center gap-1.5 px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold">Top 10 Tunggakan Terbesar</h3>
        <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="w-10 text-xs">#</TableHead>
              <TableHead className="text-xs">Pelanggan</TableHead>
              <TableHead className="text-xs">Total Tunggakan</TableHead>
              <TableHead className="text-xs">Invoice Terlambat</TableHead>
              <TableHead className="text-xs">Umur Tunggakan</TableHead>
              <TableHead className="w-[280px] text-xs">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.customer} className="text-sm">
                <TableCell className="font-medium tabular-nums">{r.rank}</TableCell>
                <TableCell className="font-medium">{r.customer}</TableCell>
                <TableCell className="whitespace-nowrap font-medium tabular-nums">
                  {formatCurrency(r.totalDebt)}
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {formatNumber(r.invoiceCount)} Invoice
                </TableCell>
                <TableCell className="text-muted-foreground">{r.ageBucket}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn('absolute inset-y-0 left-0', progressColor(r.progressPct))}
                        style={{ width: `${r.progressPct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-medium tabular-nums">
                      {r.progressPct}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
