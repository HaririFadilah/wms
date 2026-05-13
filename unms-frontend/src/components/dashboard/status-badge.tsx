import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      tone: {
        success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
        warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        danger: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
        neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
        info: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

const dotColorByTone = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  neutral: 'bg-slate-400',
  info: 'bg-sky-500',
} as const;

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof statusBadgeVariants> {
  label: string;
  showDot?: boolean;
}

export function StatusBadge({
  label,
  tone = 'neutral',
  showDot = false,
  className,
  ...rest
}: StatusBadgeProps) {
  const resolvedTone = tone ?? 'neutral';
  return (
    <span className={cn(statusBadgeVariants({ tone: resolvedTone }), className)} {...rest}>
      {showDot ? (
        <span className={cn('h-1.5 w-1.5 rounded-full', dotColorByTone[resolvedTone])} />
      ) : null}
      {label}
    </span>
  );
}
