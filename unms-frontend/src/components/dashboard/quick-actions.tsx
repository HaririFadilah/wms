import { BarChart3, FilePlus, Ticket, UserPlus, Wallet, Wifi } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { QuickActionTone } from '@/data/dashboard.dummy';

const toneClasses: Record<QuickActionTone, string> = {
  blue: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
  green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  orange: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  purple: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300',
};

const iconMap: Record<string, LucideIcon> = {
  'user-plus': UserPlus,
  'file-plus': FilePlus,
  wallet: Wallet,
  ticket: Ticket,
  wifi: Wifi,
  'bar-chart': BarChart3,
};

interface QuickActionsProps {
  actions: ReadonlyArray<{ label: string; icon: string; tone: QuickActionTone }>;
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card className="p-5 gap-4 h-full">
      <h3 className="text-sm font-semibold">Aksi Cepat</h3>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((a) => {
          const Icon = iconMap[a.icon] ?? UserPlus;
          return (
            <button
              key={a.label}
              type="button"
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center text-xs font-medium text-foreground hover:border-primary/40 hover:bg-muted/40 transition-colors"
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105',
                  toneClasses[a.tone],
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="leading-tight">{a.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
