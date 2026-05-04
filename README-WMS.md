# WMS Enterprise — Warehouse Management System

Sistem manajemen gudang skala enterprise dibangun dengan **Laravel 13** (REST API) dan **Next.js 16** (Frontend).

---

## Daftar Isi

- [Prasyarat](#prasyarat)
- [Struktur Project](#struktur-project)
- [Cara Menjalankan (Manual)](#cara-menjalankan-manual)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Setup Backend](#2-setup-backend)
  - [3. Setup Frontend](#3-setup-frontend)
  - [4. Buka Aplikasi](#4-buka-aplikasi)
- [Cara Menjalankan (Docker)](#cara-menjalankan-docker)
- [Akun Demo](#akun-demo)
- [Data Seeder](#data-seeder)
- [Fitur Aplikasi](#fitur-aplikasi)
- [API Endpoints](#api-endpoints)
- [Perintah Berguna](#perintah-berguna)
- [Troubleshooting](#troubleshooting)
- [Tech Stack](#tech-stack)

---

## Prasyarat

### Manual Setup

| Software | Versi Minimum | Download |
|----------|--------------|----------|
| PHP | 8.3+ | https://www.php.net/downloads |
| Composer | 2.x | https://getcomposer.org |
| Node.js | 20+ (disarankan 22) | https://nodejs.org |
| npm | 10+ | (termasuk dalam Node.js) |

**Ekstensi PHP yang diperlukan:**
- `mbstring`, `xml`, `curl`, `zip`, `sqlite3` (atau `pdo_mysql` untuk MySQL), `bcmath`, `gd`, `intl`

Untuk Ubuntu/Debian:
```bash
sudo add-apt-repository -y ppa:ondrej/php
sudo apt-get update
sudo apt-get install -y php8.4 php8.4-cli php8.4-mbstring php8.4-xml php8.4-curl \
  php8.4-zip php8.4-sqlite3 php8.4-bcmath php8.4-gd php8.4-intl
```

### Docker Setup

| Software | Versi Minimum |
|----------|--------------|
| Docker | 20+ |
| Docker Compose | 2.x |

---

## Struktur Project

```
wms/
├── wms-backend/          # Laravel 13 REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # 12 controller
│   │   │   ├── Requests/      # 9 Form Request (validasi input)
│   │   │   └── Resources/     # 12 API Resource (format response)
│   │   ├── Models/            # 10 model Eloquent
│   │   └── Services/          # StockService, NotificationService
│   ├── database/
│   │   ├── migrations/        # Schema database
│   │   └── seeders/           # Data demo
│   ├── routes/api.php         # Definisi semua API endpoint
│   └── Dockerfile
├── wms-frontend/         # Next.js 16 + TypeScript
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── login/         # Halaman login
│   │   │   └── (authenticated)/  # Halaman yang butuh auth
│   │   │       ├── dashboard/
│   │   │       ├── items/
│   │   │       ├── categories/
│   │   │       ├── locations/
│   │   │       ├── stock-in/
│   │   │       ├── stock-out/
│   │   │       ├── transfers/
│   │   │       ├── stock-adjustments/
│   │   │       ├── reports/
│   │   │       ├── notifications/
│   │   │       └── activity-logs/
│   │   ├── components/        # Komponen UI (sidebar, data-table, dll)
│   │   ├── context/           # Auth context provider
│   │   ├── lib/               # Axios API client
│   │   └── types/             # TypeScript type definitions
│   └── Dockerfile
├── docker-compose.yml    # Docker orchestration
└── README-WMS.md         # Dokumentasi ini
```

---

## Cara Menjalankan (Manual)

### 1. Clone Repository

```bash
git clone https://github.com/HaririFadilah/wms.git
cd wms
```

### 2. Setup Backend

```bash
cd wms-backend

# Install dependencies PHP
composer install

# Copy file environment
cp .env.example .env

# Generate application key
php artisan key:generate
```

#### Pilihan Database

**Opsi A: SQLite (Paling Mudah — tidak perlu install MySQL)**

```bash
# Ubah konfigurasi database di .env
sed -i 's/DB_CONNECTION=mysql/DB_CONNECTION=sqlite/' .env
sed -i 's/DB_DATABASE=wms/DB_DATABASE=database\/database.sqlite/' .env

# Buat file SQLite
touch database/database.sqlite
```

**Opsi B: MySQL**

1. Pastikan MySQL sudah berjalan
2. Buat database:
   ```sql
   CREATE DATABASE wms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Sesuaikan konfigurasi di file `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=wms
   DB_USERNAME=root
   DB_PASSWORD=
   ```

#### Jalankan Migrasi & Seeder

```bash
# Buat tabel dan isi data demo
php artisan migrate:fresh --seed
```

#### Jalankan Backend Server

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Backend API akan berjalan di: **http://127.0.0.1:8000/api**

> Biarkan terminal ini terbuka. Buka terminal baru untuk frontend.

### 3. Setup Frontend

```bash
cd wms-frontend

# Install dependencies Node.js
npm install

# Copy file environment
cp .env.example .env.local
```

Pastikan isi `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

#### Jalankan Frontend (Development)

```bash
npm run dev
```

Frontend akan berjalan di: **http://localhost:3000**

#### Build Frontend (Production)

```bash
npm run build
npm start
```

### 4. Buka Aplikasi

1. Buka browser dan akses **http://localhost:3000**
2. Anda akan diarahkan ke halaman login
3. Masukkan kredensial demo (lihat [Akun Demo](#akun-demo))
4. Setelah login, Anda akan masuk ke Dashboard

---

## Cara Menjalankan (Docker)

```bash
# Clone repository
git clone https://github.com/HaririFadilah/wms.git
cd wms

# Jalankan semua service (MySQL + Backend + Frontend)
docker compose up -d

# Tunggu sampai semua container running
docker compose ps

# Jalankan migrasi dan seeder
docker compose exec backend php artisan migrate:fresh --seed
```

| Service | URL | Keterangan |
|---------|-----|------------|
| Frontend | http://localhost:3000 | Aplikasi web |
| Backend API | http://localhost:8000/api | REST API |
| MySQL | localhost:3306 | Database (user: root, password: secret) |

**Perintah Docker berguna:**

```bash
# Lihat log semua service
docker compose logs -f

# Lihat log backend saja
docker compose logs -f backend

# Restart semua service
docker compose restart

# Hentikan semua service
docker compose down

# Hentikan dan hapus volume database
docker compose down -v
```

---

## Akun Demo

Setelah menjalankan `php artisan migrate:fresh --seed`, tersedia 2 akun:

| Email | Password | Role | Akses |
|-------|----------|------|-------|
| `admin@wms.test` | `password` | Admin | Semua fitur |
| `staff@wms.test` | `password` | Staff | Semua fitur (kecuali manajemen user) |

---

## Data Seeder

Database seeder (`php artisan migrate:fresh --seed`) mengisi data demo berikut:

### Kategori (6)
Router, Kabel, Modem, Switch, Aksesoris, Sparepart

### Lokasi Gudang (6)
Gudang Atas, Gudang Bawah, Rak A1, Rak A2, Rak B1, Ruang Teknisi

### Barang (10)

| Kode | Nama | Kategori | Unit | Total Stok | Min. Stok | Status |
|------|------|----------|------|-----------|-----------|--------|
| BRG-0001 | Kabel LAN Cat6 | Kabel | meter | 215 | 20 | Aman |
| BRG-0002 | Router Mikrotik RB750 | Router | unit | 6 | 5 | Aman |
| BRG-0003 | Switch 8 Port TP-Link | Switch | unit | 45 | 10 | Aman |
| BRG-0004 | Modem ADSL Huawei | Modem | unit | 0 | 8 | Habis |
| BRG-0005 | Konektor RJ45 Box | Aksesoris | box | 215 | 30 | Aman |
| BRG-0006 | Access Point Ubiquiti | Router | unit | 15 | 5 | Aman |
| BRG-0007 | Kabel Fiber Optic | Kabel | meter | 850 | 100 | Aman |
| BRG-0008 | Patch Panel 24 Port | Switch | unit | 3 | 3 | Hampir Habis |
| BRG-0009 | SFP Module 1G | Sparepart | unit | 33 | 10 | Aman |
| BRG-0010 | UPS 1000VA | Aksesoris | unit | 9 | 3 | Aman |

### Transaksi Contoh
- 2 Stok Masuk (Kabel LAN Cat6 dari PT. Nusantara Network, Router dari CV. Mitra Teknologi)
- 1 Stok Keluar (Kabel LAN Cat6 untuk instalasi)
- 1 Transfer (Kabel LAN Cat6 dari Gudang Atas ke Gudang Bawah)
- 5 Notifikasi (warning stok rendah, danger stok habis, success transfer/stok masuk)
- 3 Activity Log

---

## Fitur Aplikasi

### Dashboard
- **Statistik real-time**: Total barang, kategori, lokasi, total stok, stok rendah, stok habis
- **Grafik arus stok**: Bar chart 6 bulan terakhir (stok masuk vs keluar)
- **Distribusi per lokasi**: Pie chart jumlah stok per gudang
- **Alert stok rendah**: Daftar barang yang habis atau hampir habis
- **Transfer terbaru**: 5 transfer terakhir

### Master Data
- **Barang**: CRUD dengan kode otomatis (BRG-XXXX), search, pagination
- **Kategori**: CRUD dengan ikon dan deskripsi
- **Lokasi**: CRUD dengan warna dan deskripsi

### Transaksi Stok
- **Stok Masuk**: Tambah stok dari supplier dengan tanggal dan catatan
- **Stok Keluar**: Kurangi stok untuk keperluan tertentu (validasi stok cukup)
- **Transfer**: Pindahkan stok antar lokasi (validasi stok cukup, lokasi berbeda)
- **Adjustment**: Koreksi stok dengan 3 tipe:
  - `set` — Tetapkan jumlah stok baru
  - `add` — Tambahkan ke stok saat ini
  - `subtract` — Kurangi dari stok saat ini (validasi tidak negatif)

### Laporan
- 4 tab: Stok, Stok Rendah, Stok Masuk, Stok Keluar
- Filter rentang tanggal (dari/sampai)
- Pagination

### Notifikasi
- Notifikasi otomatis saat stok habis atau hampir habis
- Notifikasi sukses untuk transaksi
- Tandai sudah dibaca (satu atau semua)

### Activity Log
- Riwayat semua aksi pengguna
- Detail perubahan dalam format JSON (nilai lama → baru)
- IP address pengguna tercatat

### Keamanan
- **Rate limiting**: Login dibatasi 5 percobaan per menit
- **Token auth**: Laravel Sanctum (Bearer token)
- **Row-level locking**: Transaksi stok menggunakan database lock untuk mencegah race condition

---

## API Endpoints

Base URL: `http://127.0.0.1:8000/api`

### Autentikasi

| Method | Endpoint | Keterangan | Auth |
|--------|----------|------------|------|
| POST | `/login` | Login, mendapat token | Tidak (rate limited: 5/menit) |
| POST | `/logout` | Logout, revoke token | Ya |
| GET | `/profile` | Data user yang login | Ya |

### Dashboard

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/dashboard` | Statistik, chart data, alerts |

### Master Data

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/categories` | List kategori (pagination) |
| POST | `/categories` | Tambah kategori |
| GET | `/categories/{id}` | Detail kategori |
| PUT | `/categories/{id}` | Update kategori |
| DELETE | `/categories/{id}` | Hapus kategori |
| GET | `/locations` | List lokasi (pagination) |
| POST | `/locations` | Tambah lokasi |
| GET | `/locations/{id}` | Detail lokasi |
| PUT | `/locations/{id}` | Update lokasi |
| DELETE | `/locations/{id}` | Hapus lokasi |
| GET | `/items` | List barang (pagination, search) |
| POST | `/items` | Tambah barang |
| GET | `/items/{id}` | Detail barang |
| PUT | `/items/{id}` | Update barang |
| DELETE | `/items/{id}` | Hapus barang |
| GET | `/items/{id}/stocks` | Stok per lokasi |

### Transaksi

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/stock-ins` | List stok masuk (filter: from, to, per_page) |
| POST | `/stock-ins` | Tambah stok masuk |
| GET | `/stock-outs` | List stok keluar (filter: from, to, per_page) |
| POST | `/stock-outs` | Tambah stok keluar |
| GET | `/transfers` | List transfer (filter: from, to, per_page) |
| POST | `/transfers` | Tambah transfer |
| GET | `/stock-adjustments` | List adjustment (filter: from, to, item_id) |
| POST | `/stock-adjustments` | Tambah adjustment |

### Notifikasi

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/notifications` | List notifikasi |
| GET | `/notifications/unread-count` | Jumlah belum dibaca |
| PATCH | `/notifications/{id}/read` | Tandai sudah dibaca |
| POST | `/notifications/read-all` | Tandai semua sudah dibaca |

### Laporan

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/reports/stock` | Laporan semua stok (pagination) |
| GET | `/reports/stock-in` | Laporan stok masuk (filter: from, to) |
| GET | `/reports/stock-out` | Laporan stok keluar (filter: from, to) |
| GET | `/reports/transfers` | Laporan transfer |
| GET | `/reports/low-stock` | Laporan stok rendah |

### Activity Log

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/activity-logs` | List activity log (filter: action, from, to) |

### Parameter Umum

- `per_page` — Jumlah item per halaman (default: 20)
- `page` — Nomor halaman
- `from` — Tanggal mulai (format: YYYY-MM-DD)
- `to` — Tanggal akhir (format: YYYY-MM-DD)
- `search` — Kata kunci pencarian (khusus endpoint items)

### Contoh Request

```bash
# Login
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wms.test","password":"password"}'

# Respons: {"token":"1|abc123...","user":{...}}

# Ambil data dashboard
curl http://127.0.0.1:8000/api/dashboard \
  -H "Authorization: Bearer 1|abc123..."

# Tambah stok masuk
curl -X POST http://127.0.0.1:8000/api/stock-ins \
  -H "Authorization: Bearer 1|abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": 1,
    "location_id": 1,
    "quantity": 100,
    "supplier": "PT. Supplier",
    "date": "2026-05-04"
  }'

# Stock adjustment (set jumlah stok)
curl -X POST http://127.0.0.1:8000/api/stock-adjustments \
  -H "Authorization: Bearer 1|abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": 4,
    "location_id": 1,
    "type": "set",
    "quantity": 50,
    "reason": "Stock opname"
  }'
```

---

## Perintah Berguna

### Backend

```bash
cd wms-backend

# Jalankan server development
php artisan serve --host=127.0.0.1 --port=8000

# Reset database dan isi ulang data demo
php artisan migrate:fresh --seed

# Jalankan test
php artisan test

# Lint (code style check)
vendor/bin/pint --dirty

# Fix code style otomatis
vendor/bin/pint

# Clear cache
php artisan config:clear && php artisan cache:clear && php artisan route:clear
```

### Frontend

```bash
cd wms-frontend

# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Jalankan production build
npm start

# Lint check
npm run lint
```

---

## Troubleshooting

### Backend tidak bisa diakses

**Masalah**: `Connection refused` saat akses `http://127.0.0.1:8000`

**Solusi**:
1. Pastikan server backend sudah dijalankan: `php artisan serve --host=127.0.0.1 --port=8000`
2. Cek apakah port 8000 sudah digunakan: `lsof -i :8000`

### Frontend error "Network Error"

**Masalah**: Frontend tidak bisa terhubung ke API

**Solusi**:
1. Pastikan backend sudah berjalan di port 8000
2. Cek file `.env.local` di `wms-frontend/`:
   ```
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
   ```
3. Restart frontend setelah mengubah `.env.local`

### Database error saat migrasi

**Masalah**: Error saat `php artisan migrate`

**Solusi SQLite**:
1. Pastikan ekstensi sqlite3 terinstall: `php -m | grep sqlite`
2. Pastikan file database ada: `touch database/database.sqlite`
3. Pastikan .env sudah benar:
   ```
   DB_CONNECTION=sqlite
   DB_DATABASE=database/database.sqlite
   ```

**Solusi MySQL**:
1. Pastikan MySQL berjalan: `sudo systemctl status mysql`
2. Pastikan database `wms` sudah dibuat
3. Cek kredensial di `.env`

### PHP extension missing

**Masalah**: `Call to undefined function` atau `Extension not found`

**Solusi** (Ubuntu/Debian):
```bash
sudo apt-get install -y php8.4-mbstring php8.4-xml php8.4-curl \
  php8.4-zip php8.4-sqlite3 php8.4-bcmath php8.4-gd php8.4-intl
```

### Rate limit saat login

**Masalah**: `Too Many Attempts` saat login

**Solusi**: Login dibatasi 5 percobaan per menit. Tunggu 1 menit atau clear rate limiter:
```bash
php artisan cache:clear
```

---

## Tech Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Backend Framework | Laravel | 13.x |
| Backend Language | PHP | 8.3+ |
| Authentication | Laravel Sanctum | 4.x |
| Frontend Framework | Next.js | 16.x |
| Frontend Language | TypeScript | 5.x |
| CSS Framework | Tailwind CSS | v4 |
| UI Components | shadcn/ui | (base-ui) |
| Charts | Recharts | 2.x |
| HTTP Client | Axios | 1.x |
| Icons | Lucide React | - |
| Database | MySQL 8.0 / SQLite | - |
| Container | Docker + Docker Compose | - |
