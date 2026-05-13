'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DataPoint {
  date: string;
  revenue: number;
}

interface RevenueAreaChartProps {
  data: ReadonlyArray<DataPoint>;
}

export function RevenueAreaChart({ data }: RevenueAreaChartProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.62 0.2 261)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="oklch(0.62 0.2 261)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="var(--color-muted-foreground)"
            tick={{ fontSize: 11 }}
            interval={3}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${v} jt`}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            cursor={{ stroke: 'oklch(0.62 0.2 261)', strokeWidth: 1, strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: 'var(--color-popover)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
            formatter={(value) => [`Rp ${value as number} jt`, 'Pendapatan']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="oklch(0.62 0.2 261)"
            strokeWidth={2}
            fill="url(#revenueArea)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
