import { AlertTriangle, CheckCircle2, Router, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/format';

interface NetworkStatusProps {
  online: { count: number; pct: number };
  warning: { count: number; pct: number };
  offline: { count: number; pct: number };
  totalDevices: number;
  systemHealthy: boolean;
}

export function NetworkStatus({
  online,
  warning,
  offline,
  totalDevices,
  systemHealthy,
}: NetworkStatusProps) {
  return (
    <Card className="p-5 gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Status Jaringan & Router</h3>
        <button type="button" className="text-xs font-medium text-primary hover:underline">
          Lihat Semua
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile
          tone="success"
          icon={<Router className="h-5 w-5 text-emerald-600" aria-hidden />}
          count={online.count}
          pct={online.pct}
          label="Online"
        />
        <StatTile
          tone="warning"
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />}
          count={warning.count}
          pct={warning.pct}
          label="Warning"
        />
        <StatTile
          tone="danger"
          icon={<XCircle className="h-5 w-5 text-rose-600" aria-hidden />}
          count={offline.count}
          pct={offline.pct}
          label="Offline"
        />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Total Perangkat</div>
          <div className="text-lg font-bold tabular-nums">{formatNumber(totalDevices)}</div>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <CheckCircle2
            className={`h-3.5 w-3.5 ${systemHealthy ? 'text-emerald-500' : 'text-amber-500'}`}
            aria-hidden
          />
          <span className={systemHealthy ? 'text-emerald-700' : 'text-amber-700'}>
            {systemHealthy ? 'Semua sistem normal' : 'Perhatian diperlukan'}
          </span>
        </div>
      </div>
    </Card>
  );
}

function StatTile({
  tone,
  icon,
  count,
  pct,
  label,
}: {
  tone: 'success' | 'warning' | 'danger';
  icon: React.ReactNode;
  count: number;
  pct: number;
  label: string;
}) {
  const bg =
    tone === 'success'
      ? 'bg-emerald-50 dark:bg-emerald-500/10'
      : tone === 'warning'
        ? 'bg-amber-50 dark:bg-amber-500/10'
        : 'bg-rose-50 dark:bg-rose-500/10';

  return (
    <div className="text-center">
      <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
        {icon}
      </div>
      <div className="text-base font-bold tabular-nums">{formatNumber(count)}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-[10px] text-muted-foreground">{pct}%</div>
    </div>
  );
}
