import { FileText, MessageSquare, Users, Wallet, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/dashboard/app-shell';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { Card } from '@/components/ui/card';
import { RevenueAreaChart } from '@/components/dashboard/revenue-area-chart';
import { InvoiceStatusDonut } from '@/components/dashboard/invoice-status-donut';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { UpcomingDue } from '@/components/dashboard/upcoming-due';
import { NetworkStatus } from '@/components/dashboard/network-status';
import { AiInsight } from '@/components/dashboard/ai-insight';
import { TopOverdue } from '@/components/dashboard/top-overdue';
import {
  aiInsight,
  dashboardKpis,
  invoiceStatusDistribution,
  invoiceTotal,
  lastInvoiceUpdate,
  networkStatus,
  quickActions,
  recentTransactions,
  revenueTrend30Days,
  topOverdue,
  upcomingDue,
} from '@/data/dashboard.dummy';
import { formatCurrency, formatNumber } from '@/lib/format';

export default function DashboardPage() {
  return (
    <AppShell activeNav="/" breadcrumb={['Dashboard', 'Overview']}>
      <div className="flex flex-col gap-6">
        {/* Row 1 — KPI cards */}
        <section
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="KPI ringkasan"
        >
          <KpiCard
            label="Total Pelanggan Aktif"
            value={formatNumber(dashboardKpis.totalCustomers.value)}
            delta={dashboardKpis.totalCustomers.deltaPct}
            icon={Users}
            tone="blue"
            sparkline={dashboardKpis.totalCustomers.sparkline}
          />
          <KpiCard
            label="Pendapatan Bulan Ini"
            value={formatCurrency(dashboardKpis.monthlyRevenue.value)}
            delta={dashboardKpis.monthlyRevenue.deltaPct}
            icon={Wallet}
            tone="green"
            sparkline={dashboardKpis.monthlyRevenue.sparkline}
          />
          <KpiCard
            label="Invoice Outstanding"
            value={formatCurrency(dashboardKpis.outstandingInvoice.value)}
            delta={dashboardKpis.outstandingInvoice.deltaPct}
            icon={FileText}
            tone="orange"
            sparkline={dashboardKpis.outstandingInvoice.sparkline}
          />
          <KpiCard
            label="Tiket Open"
            value={formatNumber(dashboardKpis.openTickets.value)}
            delta={dashboardKpis.openTickets.deltaPct}
            deltaSuffix="dari minggu lalu"
            icon={MessageSquare}
            tone="purple"
            sparkline={dashboardKpis.openTickets.sparkline}
          />
        </section>

        {/* Row 2 — Revenue chart + invoice donut + quick actions */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-6 p-5 gap-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">Tren Pendapatan (30 Hari Terakhir)</h3>
              <select
                className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground"
                defaultValue="30"
              >
                <option value="7">7 Hari Terakhir</option>
                <option value="30">30 Hari Terakhir</option>
                <option value="90">90 Hari Terakhir</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Pendapatan (Rp)</span>
            </div>
            <RevenueAreaChart data={revenueTrend30Days} />
          </Card>

          <Card className="lg:col-span-4 p-5 gap-4">
            <h3 className="text-sm font-semibold">Distribusi Status Invoice</h3>
            <InvoiceStatusDonut data={invoiceStatusDistribution} total={invoiceTotal} />
            <div className="flex items-center gap-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
              <RefreshCw className="h-3 w-3" aria-hidden />
              Terakhir diperbarui: {lastInvoiceUpdate}
            </div>
          </Card>

          <div className="lg:col-span-2">
            <QuickActions actions={quickActions} />
          </div>
        </section>

        {/* Row 3 — Recent txn (left), upcoming due (mid), network+AI (right) */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <RecentTransactions rows={recentTransactions} />
          </div>
          <div className="lg:col-span-4">
            <UpcomingDue rows={upcomingDue} />
          </div>
          <div className="lg:col-span-3 flex flex-col gap-4">
            <NetworkStatus
              online={networkStatus.online}
              warning={networkStatus.warning}
              offline={networkStatus.offline}
              totalDevices={networkStatus.totalDevices}
              systemHealthy={networkStatus.systemHealthy}
            />
            <AiInsight {...aiInsight} />
          </div>
        </section>

        {/* Row 4 — Top 10 Tunggakan */}
        <section>
          <TopOverdue rows={topOverdue} />
        </section>
      </div>
    </AppShell>
  );
}
