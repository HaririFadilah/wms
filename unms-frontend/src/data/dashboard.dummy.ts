/**
 * Dummy data for the UNMS dashboard preview.
 * Will be replaced by real API calls from BE-0501 (dashboard endpoints).
 */

export const dashboardKpis = {
  totalCustomers: { value: 12458, deltaPct: 4.2, sparkline: [80, 92, 88, 95, 102, 110, 108, 120] },
  monthlyRevenue: {
    value: 1_245_780_000,
    deltaPct: 12.6,
    sparkline: [60, 72, 80, 78, 92, 105, 110, 124],
  },
  outstandingInvoice: {
    value: 342_560_000,
    deltaPct: -8.7,
    sparkline: [120, 105, 96, 88, 82, 70, 65, 60],
  },
  openTickets: { value: 128, deltaPct: -5.6, sparkline: [40, 38, 32, 30, 36, 28, 25, 22] },
} as const;

/** 30-day revenue trend (millions IDR). Used for the area chart. */
export const revenueTrend30Days = [
  { date: '20 Apr', revenue: 22 },
  { date: '21 Apr', revenue: 24 },
  { date: '22 Apr', revenue: 19 },
  { date: '23 Apr', revenue: 28 },
  { date: '24 Apr', revenue: 30 },
  { date: '25 Apr', revenue: 26 },
  { date: '26 Apr', revenue: 35 },
  { date: '27 Apr', revenue: 32 },
  { date: '28 Apr', revenue: 30 },
  { date: '29 Apr', revenue: 27 },
  { date: '30 Apr', revenue: 34 },
  { date: '1 Mei', revenue: 31 },
  { date: '2 Mei', revenue: 38 },
  { date: '3 Mei', revenue: 36 },
  { date: '4 Mei', revenue: 33 },
  { date: '5 Mei', revenue: 30 },
  { date: '6 Mei', revenue: 42 },
  { date: '7 Mei', revenue: 38 },
  { date: '8 Mei', revenue: 34 },
  { date: '9 Mei', revenue: 40 },
  { date: '10 Mei', revenue: 36 },
  { date: '11 Mei', revenue: 33 },
  { date: '12 Mei', revenue: 41 },
  { date: '13 Mei', revenue: 38 },
  { date: '14 Mei', revenue: 45 },
  { date: '15 Mei', revenue: 42 },
  { date: '16 Mei', revenue: 39 },
  { date: '17 Mei', revenue: 41 },
  { date: '18 Mei', revenue: 47 },
];

export const invoiceStatusDistribution = [
  { status: 'Lunas', count: 1245, percent: 50.7, color: '#10B981' },
  { status: 'Belum Lunas', count: 842, percent: 34.3, color: '#F59E0B' },
  { status: 'Terlambat', count: 271, percent: 11.0, color: '#EF4444' },
  { status: 'Dibatalkan', count: 100, percent: 4.0, color: '#94A3B8' },
];

export const invoiceTotal = invoiceStatusDistribution.reduce((s, x) => s + x.count, 0);

export type QuickActionTone = 'blue' | 'green' | 'orange' | 'purple' | 'rose' | 'cyan';

export const quickActions: ReadonlyArray<{
  label: string;
  icon: 'user-plus' | 'file-plus' | 'wallet' | 'ticket' | 'wifi' | 'bar-chart';
  tone: QuickActionTone;
}> = [
  { label: 'Tambah Pelanggan', icon: 'user-plus', tone: 'blue' },
  { label: 'Buat Invoice', icon: 'file-plus', tone: 'green' },
  { label: 'Terima Pembayaran', icon: 'wallet', tone: 'orange' },
  { label: 'Buat Tiket', icon: 'ticket', tone: 'rose' },
  { label: 'Cek Perangkat', icon: 'wifi', tone: 'cyan' },
  { label: 'Laporan Pendapatan', icon: 'bar-chart', tone: 'purple' },
];

export type InvoiceStatus = 'Lunas' | 'Belum Lunas' | 'Terlambat' | 'Dibatalkan';

export interface RecentTransaction {
  date: string;
  invoiceNo: string;
  customer: string;
  description: string;
  amount: number;
  status: InvoiceStatus;
}

export const recentTransactions: ReadonlyArray<RecentTransaction> = [
  {
    date: '18 Mei 2025 10:12',
    invoiceNo: 'INV/2025/0518/0123',
    customer: 'CV. Maju Jaya Abadi',
    description: 'Internet Business 100 Mbps',
    amount: 1_250_000,
    status: 'Lunas',
  },
  {
    date: '18 Mei 2025 09:45',
    invoiceNo: 'INV/2025/0518/0122',
    customer: 'PT. Sinar Digital',
    description: 'Internet Dedicated 50 Mbps',
    amount: 850_000,
    status: 'Belum Lunas',
  },
  {
    date: '18 Mei 2025 09:10',
    invoiceNo: 'INV/2025/0518/0121',
    customer: 'Budi Setiawan',
    description: 'Internet Home 30 Mbps',
    amount: 300_000,
    status: 'Lunas',
  },
  {
    date: '17 Mei 2025 16:30',
    invoiceNo: 'INV/2025/0517/0119',
    customer: 'Toko Berkah Sentosa',
    description: 'Internet Business 50 Mbps',
    amount: 600_000,
    status: 'Terlambat',
  },
  {
    date: '17 Mei 2025 15:05',
    invoiceNo: 'INV/2025/0517/0118',
    customer: 'Dewi Lestari',
    description: 'Internet Home 20 Mbps',
    amount: 250_000,
    status: 'Lunas',
  },
];

export interface UpcomingDueCustomer {
  customer: string;
  packageName: string;
  dueDate: string;
  daysLeft: number;
}

export const upcomingDue: ReadonlyArray<UpcomingDueCustomer> = [
  { customer: 'PT. Cipta Karya', packageName: 'Biz 100 Mbps', dueDate: '22 Mei 2025', daysLeft: 3 },
  { customer: 'Hotel Nusantara', packageName: 'Biz 50 Mbps', dueDate: '25 Mei 2025', daysLeft: 6 },
  {
    customer: 'CV. Sejahtera Abadi',
    packageName: 'Biz 30 Mbps',
    dueDate: '27 Mei 2025',
    daysLeft: 8,
  },
  {
    customer: 'Toko Sumber Rejeki',
    packageName: 'Home 20 Mbps',
    dueDate: '28 Mei 2025',
    daysLeft: 9,
  },
  { customer: 'Andi Pratama', packageName: 'Home 30 Mbps', dueDate: '29 Mei 2025', daysLeft: 10 },
];

export const networkStatus = {
  online: { count: 128, pct: 80 },
  warning: { count: 16, pct: 10 },
  offline: { count: 16, pct: 10 },
  totalDevices: 160,
  systemHealthy: true,
};

export interface OverdueRow {
  rank: number;
  customer: string;
  totalDebt: number;
  invoiceCount: number;
  ageBucket: '> 90 hari' | '61–90 hari' | '31–60 hari' | '16–30 hari';
  progressPct: number;
}

export const topOverdue: ReadonlyArray<OverdueRow> = [
  {
    rank: 1,
    customer: 'PT. Mega Jaya Makmur',
    totalDebt: 45_750_000,
    invoiceCount: 5,
    ageBucket: '> 90 hari',
    progressPct: 91,
  },
  {
    rank: 2,
    customer: 'CV. Karya Mandiri',
    totalDebt: 32_860_000,
    invoiceCount: 4,
    ageBucket: '61–90 hari',
    progressPct: 66,
  },
  {
    rank: 3,
    customer: 'PT. Sumber Rezeki',
    totalDebt: 28_250_000,
    invoiceCount: 3,
    ageBucket: '31–60 hari',
    progressPct: 57,
  },
  {
    rank: 4,
    customer: 'UD. Sejahtera Bersama',
    totalDebt: 18_900_000,
    invoiceCount: 3,
    ageBucket: '31–60 hari',
    progressPct: 38,
  },
  {
    rank: 5,
    customer: 'Toko Makmur Abadi',
    totalDebt: 15_450_000,
    invoiceCount: 2,
    ageBucket: '16–30 hari',
    progressPct: 31,
  },
];

export const aiInsight = {
  title: 'Insight Mingguan',
  body: 'Pendapatan minggu ini naik 14,2% dibanding minggu lalu. Segmen Business memberikan kontribusi terbesar (62%).',
  model: 'UNMS AI v1.2',
  lastUpdated: '18 Mei 2025',
};

export const lastInvoiceUpdate = '18 Mei 2025 10:15';
