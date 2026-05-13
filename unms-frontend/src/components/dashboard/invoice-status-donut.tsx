'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatNumber } from '@/lib/format';

interface Slice {
  status: string;
  count: number;
  percent: number;
  color: string;
}

interface InvoiceStatusDonutProps {
  data: ReadonlyArray<Slice>;
  total: number;
}

export function InvoiceStatusDonut({ data, total }: InvoiceStatusDonutProps) {
  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <div className="relative h-[200px] w-[200px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data as Slice[]}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={86}
              paddingAngle={2}
              isAnimationActive={false}
              strokeWidth={0}
            >
              {data.map((s) => (
                <Cell key={s.status} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-2xl font-bold tracking-tight tabular-nums">
            {formatNumber(total)}
          </span>
          <span className="text-xs text-muted-foreground">Invoice</span>
        </div>
      </div>

      <ul className="flex-1 space-y-2.5 text-sm">
        {data.map((s) => (
          <li key={s.status} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
              aria-hidden
            />
            <span className="text-foreground">{s.status}</span>
            <span className="ml-auto flex items-baseline gap-1 tabular-nums">
              <span className="font-medium">{formatNumber(s.count)}</span>
              <span className="text-xs text-muted-foreground">
                ({s.percent.toLocaleString('id-ID', { minimumFractionDigits: 1 })}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
