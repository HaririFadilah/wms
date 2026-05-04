# WMS Enterprise Upgrade — Test Plan

## What Changed
- Backend: Form Request validation, API Resources, pagination, rate limiting, stock adjustment, audit trail, real dashboard data, date filters
- Frontend: Complete Next.js 16 app with login, dashboard, CRUD pages, stock transactions, reports, notifications, activity logs

## Primary Flow: Login → Dashboard → Stock Adjustment → Verify Side Effects

### Test 1: Login and Dashboard with Real Data
**Steps:**
1. Navigate to `http://localhost:3000`
2. Should redirect to `/login` page
3. Enter `admin@wms.test` / `password`, click "Masuk"
4. Should redirect to `/dashboard`

**Assertions:**
- Dashboard stats card "Total Barang" shows `10`
- Stats card "Kategori" shows `6`
- Stats card "Lokasi" shows `6`
- Stats card "Stok Habis" shows `1` (BRG-0004 Modem ADSL Huawei)
- Stats card "Stok Rendah" shows `1` (BRG-0008 Patch Panel)
- Stock alerts section shows "Modem ADSL Huawei" with "Habis" badge
- Stock alerts section shows "Patch Panel 24 Port" with "Hampir Habis" badge
- Bar chart and pie chart are rendered (not empty/blank)

### Test 2: Items Page with Pagination and Search
**Steps:**
1. Click "Barang" in sidebar
2. Page shows table with seeded items
3. Type "Kabel" in search box

**Assertions:**
- Items table initially shows all 10 items (or paginated subset)
- After searching "Kabel", only items containing "Kabel" appear (BRG-0001 Kabel LAN Cat6, BRG-0007 Kabel Fiber Optic)
- Each row shows code, name, category, unit, total stock, min stock, status badge
- BRG-0004 row shows red "Habis" badge

### Test 3: Create Stock Adjustment (the NEW feature)
**Steps:**
1. Click "Adjustment" in sidebar
2. Page should initially show empty table (no adjustments seeded)
3. Click "Adjustment Baru" button
4. Fill form: Barang = "BRG-0004 - Modem ADSL Huawei", Lokasi = "Gudang Atas", Tipe = "Set (tetapkan)", Jumlah = 50, Alasan = "Stock opname", click Simpan
5. Verify the new adjustment appears in the table

**Assertions:**
- Empty table initially shows "Tidak ada data."
- After creation, table shows 1 row with: Barang="Modem ADSL Huawei", Lokasi="Gudang Atas", Tipe="Set" badge, Stok Lama=0, Stok Baru=50, Alasan="Stock opname"
- Toast notification "Adjustment berhasil." appears

### Test 4: Verify Adjustment Side Effects (Dashboard + Activity Log)
**Steps:**
1. Navigate to "Activity Log" in sidebar
2. Verify the stock_adjustment action is logged
3. Navigate back to "Dashboard"
4. Verify "Stok Habis" count decreased (BRG-0004 now has stock=50)

**Assertions:**
- Activity Log table shows a row with action badge "stock_adjustment"
- Activity Log row shows description containing "Adjustment stok item"
- Activity Log row shows changes JSON with old_quantity=0 and new_quantity=50
- Dashboard "Stok Habis" now shows `0` (was `1` before adjustment)
- Dashboard stock alerts no longer shows "Modem ADSL Huawei" as "Habis"

### Test 5: Notifications Page
**Steps:**
1. Click "Notifikasi" in sidebar
2. Verify seeded notifications are displayed
3. Click on an unread notification to mark as read

**Assertions:**
- Page shows notification cards (seeded: 5 notifications)
- At least one notification has "Baru" badge (unread)
- After clicking an unread notification, the "Baru" badge disappears from that notification
