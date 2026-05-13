import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Sparkline } from '@/components/dashboard/sparkline';
import { cn } from '@/lib/utils';

export type KpiCardTone = 'blue' | 'green' | 'orange' | 'purple';

const toneStyles: Record<KpiCardTone, { iconBg: string; iconText: string; spark: string }> = {
  blue: {
    iconBg: 'bg-sky-100 dark:bg-sky-500/15',
    iconText: 'text-sky-600 dark:text-sky-300',
    spark: 'oklch(0.62 0.2 261)',
  },
  green: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/15',
    iconText: 'text-emerald-600 dark:text-emerald-300',
    spark: 'oklch(0.72 0.17 152)',
  },
  orange: {
    iconBg: 'bg-amber-100 dark:bg-amber-500/15',
    iconText: 'text-amber-600 dark:text-amber-300',
    spark: 'oklch(0.74 0.18 60)',
  },
  purple: {
    iconBg: 'bg-violet-100 dark:bg-violet-500/15',
    iconText: 'text-violet-600 dark:text-violet-300',
    spark: 'oklch(0.65 0.21 295)',
  },
};

interface KpiCardProps {
  label: string;
  value: string;
  delta: number;
  deltaSuffix?: string;
  icon: LucideIcon;
  tone: KpiCardTone;
  sparkline: ReadonlyArray<number>;
}

export function KpiCard({
  label,
  value,
  delta,
  deltaSuffix = 'dari bulan lalu',
  icon: Icon,
  tone,
  sparkline,
}: KpiCardProps) {
  const tones = toneStyles[tone];
  const positive = delta >= 0;
  const DeltaIcon = positive ? ArrowUpRight : ArrowDownRight;
  const deltaText = `${positive ? '+' : ''}${delta.toLocaleString('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;

  return (
    <Card className="p-5 gap-3">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            tones.iconBg,
          )}
        >
          <Icon className={cn('h-5 w-5', tones.iconText)} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[13px] text-muted-foreground">
            <span className="truncate">{label}</span>
            <Info className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
          </div>
          <div className="mt-1 flex items-end gap-3">
            <div className="text-2xl font-bold tracking-tight tabular-nums">{value}</div>
            <div className="ml-auto hidden h-9 w-20 self-end md:block">
              <Sparkline data={sparkline} color={tones.spark} height={36} ariaLabel={`Tren ${label}`} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center text-xs">
        <span
          className={cn(
            'inline-flex items-center gap-0.5 font-medium',
            positive ? 'text-emerald-600' : 'text-rose-600',
          )}
        >
          <DeltaIcon className="h-3.5 w-3.5" aria-hidden />
          {deltaText}
        </span>
        <span className="ml-1 text-muted-foreground">{deltaSuffix}</span>
      </div>
    </Card>
  );
}
