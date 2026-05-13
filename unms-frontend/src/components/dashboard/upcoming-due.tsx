import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/dashboard/status-badge';
import type { UpcomingDueCustomer } from '@/data/dashboard.dummy';

function toneByDaysLeft(days: number): 'danger' | 'warning' | 'success' {
  if (days <= 3) return 'danger';
  if (days <= 7) return 'warning';
  return 'success';
}

interface Props {
  rows: ReadonlyArray<UpcomingDueCustomer>;
}

export function UpcomingDue({ rows }: Props) {
  return (
    <Card className="p-0 gap-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold">Pelanggan Mendekati Jatuh Tempo</h3>
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
              <TableHead className="text-xs">Pelanggan</TableHead>
              <TableHead className="text-xs">Paket</TableHead>
              <TableHead className="text-xs">Jatuh Tempo</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.customer} className="text-sm">
                <TableCell className="font-medium">{r.customer}</TableCell>
                <TableCell className="text-muted-foreground">{r.packageName}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {r.dueDate}
                </TableCell>
                <TableCell>
                  <StatusBadge label={`${r.daysLeft} hari lagi`} tone={toneByDaysLeft(r.daysLeft)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
