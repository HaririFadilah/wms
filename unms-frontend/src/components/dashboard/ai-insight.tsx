import { ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AiInsightProps {
  title: string;
  body: string;
  model: string;
  lastUpdated: string;
}

export function AiInsight({ title, body, model, lastUpdated }: AiInsightProps) {
  return (
    <Card className="p-5 gap-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">Insight AI</h3>
        <Badge className="bg-primary/10 text-primary text-[10px] px-1.5 h-5">New</Badge>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-4 dark:from-sky-500/10 dark:via-blue-500/10 dark:to-indigo-500/10">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Lihat Analisis Lengkap
              <ArrowRight className="h-3 w-3" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground">
        Model: {model} · Terakhir diperbarui: {lastUpdated}
      </div>
    </Card>
  );
}
