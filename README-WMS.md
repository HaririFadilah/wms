# WMS Laravel + Next.js

Struktur aplikasi:

- `wms-backend`: Laravel 13 API dengan Sanctum token auth, MySQL, migrasi, seed data, dan endpoint WMS.
- `wms-frontend`: Next.js UI untuk dashboard WMS, transaksi stok, transfer, notifikasi, laporan, dan riwayat.
- `wms-app.html`: dummy UI referensi awal.
- `wms-backend-guide.md`: backend guide referensi awal.

## Akun Demo

- Admin: `admin@wms.test`
- Staff: `staff@wms.test`
- Password: `password`

## Jalankan Backend

Pastikan MySQL XAMPP aktif. Database default: `wms`, user `root`, password kosong.

```bash
cd wms-backend
php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=8000
```

API tersedia di `http://127.0.0.1:8000/api`.

## Jalankan Frontend

```bash
cd wms-frontend
npm run dev
```

Frontend membaca `NEXT_PUBLIC_API_URL` dari `wms-frontend/.env.local`.

## Verifikasi

```bash
cd wms-backend
php artisan test
vendor/bin/pint --dirty

cd ../wms-frontend
npm run build
npm run lint
```
