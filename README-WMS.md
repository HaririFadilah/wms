# WMS Enterprise — Laravel 13 + Next.js 16

Warehouse Management System skala enterprise dengan Laravel 13 REST API dan Next.js 16 frontend.

## Struktur Aplikasi

- `wms-backend/` — Laravel 13 API (PHP 8.4, Sanctum, MySQL/SQLite)
- `wms-frontend/` — Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
- `docker-compose.yml` — Docker setup (MySQL, Backend, Frontend)

## Fitur

### Backend
- REST API dengan Form Request validation dan API Resource response
- Pagination di semua list endpoint
- Rate limiting pada login (5 percobaan/menit)
- CRUD: Kategori, Lokasi, Barang
- Transaksi: Stok Masuk, Stok Keluar, Transfer, **Stock Adjustment**
- Structured audit trail (entity, changes, IP address)
- Date range filter di semua laporan dan transaksi
- Dashboard dengan data real-time (stock flow chart, distribusi lokasi)
- Notifikasi otomatis stok rendah/habis
- Export endpoint (Excel/PDF ready)

### Frontend
- Login dengan token-based auth
- Dashboard dengan chart (Recharts) — arus stok, distribusi lokasi, alert
- CRUD pages dengan search, pagination, dialog form
- Stock In, Stock Out, Transfer, Adjustment dengan form lengkap
- Reports dengan tabs dan date range filter
- Notifikasi dengan mark read/read all
- Activity Log dengan filter aksi dan tanggal
- Responsive design (sidebar + mobile sheet)

## Akun Demo

| Email | Role | Password |
|---|---|---|
| admin@wms.test | admin | password |
| staff@wms.test | staff | password |

## Quick Start

### Manual

```bash
# Backend
cd wms-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=8000

# Frontend
cd wms-frontend
npm install
cp .env.example .env.local
npm run dev
```

### Docker

```bash
docker compose up -d
docker compose exec backend php artisan migrate:fresh --seed
```

- API: http://localhost:8000/api
- Frontend: http://localhost:3000

## Verifikasi

```bash
# Backend
cd wms-backend
php artisan test
vendor/bin/pint --dirty

# Frontend
cd wms-frontend
npm run build
npm run lint
```

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 13, PHP 8.4, Sanctum 4 |
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui |
| Database | MySQL 8.0 / SQLite |
| Charts | Recharts |
| HTTP Client | Axios |
| Icons | Lucide React |
| Container | Docker + Docker Compose |
