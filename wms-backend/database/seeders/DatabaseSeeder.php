<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Item;
use App\Models\ItemStock;
use App\Models\Location;
use App\Models\Notification;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\StockTransfer;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin WMS',
            'email' => 'admin@wms.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $staff = User::create([
            'name' => 'Staff Gudang',
            'email' => 'staff@wms.test',
            'password' => Hash::make('password'),
            'role' => 'staff',
        ]);

        $categories = collect([
            ['name' => 'Router', 'description' => 'Perangkat routing jaringan', 'icon' => 'router'],
            ['name' => 'Kabel', 'description' => 'Semua jenis kabel jaringan', 'icon' => 'cable'],
            ['name' => 'Modem', 'description' => 'Perangkat modem broadband', 'icon' => 'wifi'],
            ['name' => 'Switch', 'description' => 'Network switch berbagai ukuran', 'icon' => 'network'],
            ['name' => 'Aksesoris', 'description' => 'Aksesoris jaringan pelengkap', 'icon' => 'tool'],
            ['name' => 'Sparepart', 'description' => 'Suku cadang perangkat jaringan', 'icon' => 'settings'],
        ])->mapWithKeys(fn (array $data): array => [$data['name'] => Category::create($data)]);

        $locations = collect([
            ['name' => 'Gudang Atas', 'description' => 'Lantai 2 - Penyimpanan utama barang baru', 'icon' => 'warehouse', 'color' => '#a3e635'],
            ['name' => 'Gudang Bawah', 'description' => 'Lantai 1 - Stok operasional harian', 'icon' => 'building', 'color' => '#60a5fa'],
            ['name' => 'Rak A1', 'description' => 'Area A - Rak pertama baris A', 'icon' => 'box', 'color' => '#fbbf24'],
            ['name' => 'Rak A2', 'description' => 'Area A - Rak kedua baris A', 'icon' => 'box', 'color' => '#f97316'],
            ['name' => 'Rak B1', 'description' => 'Area B - Rak pertama baris B', 'icon' => 'archive', 'color' => '#a78bfa'],
            ['name' => 'Ruang Teknisi', 'description' => 'Ruangan khusus teknisi lapangan', 'icon' => 'wrench', 'color' => '#2dd4bf'],
        ])->mapWithKeys(fn (array $data): array => [$data['name'] => Location::create($data)]);

        $items = [
            ['BRG-0001', 'Kabel LAN Cat6', 'Kabel', 'meter', 20, [100, 50, 30, 0, 20, 15]],
            ['BRG-0002', 'Router Mikrotik RB750', 'Router', 'unit', 5, [3, 0, 2, 0, 0, 1]],
            ['BRG-0003', 'Switch 8 Port TP-Link', 'Switch', 'unit', 10, [25, 10, 5, 2, 0, 3]],
            ['BRG-0004', 'Modem ADSL Huawei', 'Modem', 'unit', 8, [0, 0, 0, 0, 0, 0]],
            ['BRG-0005', 'Konektor RJ45 Box', 'Aksesoris', 'box', 30, [80, 40, 60, 20, 10, 5]],
            ['BRG-0006', 'Access Point Ubiquiti', 'Router', 'unit', 5, [8, 4, 0, 2, 1, 0]],
            ['BRG-0007', 'Kabel Fiber Optic', 'Kabel', 'meter', 100, [500, 200, 0, 0, 150, 0]],
            ['BRG-0008', 'Patch Panel 24 Port', 'Switch', 'unit', 3, [2, 1, 0, 0, 0, 0]],
            ['BRG-0009', 'SFP Module 1G', 'Sparepart', 'unit', 10, [15, 8, 0, 5, 3, 2]],
            ['BRG-0010', 'UPS 1000VA', 'Aksesoris', 'unit', 3, [5, 2, 1, 0, 0, 1]],
        ];

        foreach ($items as [$code, $name, $category, $unit, $minimumStock, $stocks]) {
            $item = Item::create([
                'code' => $code,
                'name' => $name,
                'category_id' => $categories[$category]->id,
                'unit' => $unit,
                'minimum_stock' => $minimumStock,
            ]);

            foreach ($stocks as $index => $quantity) {
                ItemStock::create([
                    'item_id' => $item->id,
                    'location_id' => $locations->values()[$index]->id,
                    'quantity' => $quantity,
                ]);
            }
        }

        StockIn::create([
            'item_id' => Item::where('code', 'BRG-0001')->value('id'),
            'location_id' => $locations['Gudang Atas']->id,
            'quantity' => 200,
            'supplier' => 'PT. Nusantara Network',
            'date' => '2026-05-03',
            'note' => 'Pembelian reguler',
            'user_id' => $admin->id,
        ]);

        StockIn::create([
            'item_id' => Item::where('code', 'BRG-0002')->value('id'),
            'location_id' => $locations['Gudang Atas']->id,
            'quantity' => 10,
            'supplier' => 'CV. Mitra Teknologi',
            'date' => '2026-05-02',
            'user_id' => $admin->id,
        ]);

        StockOut::create([
            'item_id' => Item::where('code', 'BRG-0001')->value('id'),
            'location_id' => $locations['Gudang Bawah']->id,
            'quantity' => 30,
            'purpose' => 'Instalasi Client A',
            'date' => '2026-05-03',
            'note' => 'Proyek Sukabumi',
            'user_id' => $staff->id,
        ]);

        StockTransfer::create([
            'item_id' => Item::where('code', 'BRG-0001')->value('id'),
            'from_location_id' => $locations['Gudang Atas']->id,
            'to_location_id' => $locations['Gudang Bawah']->id,
            'quantity' => 50,
            'note' => 'Distribusi stok operasional',
            'user_id' => $admin->id,
        ]);

        foreach ([
            ['warning', 'Stok hampir habis', 'Router Mikrotik RB750 - Sisa stok: 6 unit (Min: 5)'],
            ['danger', 'Stok habis', 'Modem ADSL Huawei - Stok 0 di semua lokasi'],
            ['danger', 'Stok hampir habis', 'Patch Panel 24 Port - Sisa stok: 3 unit (Min: 3)'],
            ['success', 'Transfer berhasil', '50 meter Kabel LAN Cat6 dari Gudang Atas ke Gudang Bawah'],
            ['success', 'Stok masuk berhasil', '200 meter Kabel LAN Cat6 masuk ke Gudang Atas'],
        ] as [$type, $title, $message]) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'is_read' => false,
            ]);
        }

        foreach ([
            ['transfer', 'Transfer 50 meter Kabel LAN Cat6 dari Gudang Atas ke Gudang Bawah', $admin->id],
            ['stock_in', 'Stok masuk 200 meter Kabel LAN Cat6 ke Gudang Atas dari PT. Nusantara Network', $admin->id],
            ['stock_out', 'Stok keluar 30 meter Kabel LAN Cat6 dari Gudang Bawah untuk Instalasi Client A', $staff->id],
        ] as [$action, $description, $userId]) {
            ActivityLog::create([
                'action' => $action,
                'description' => $description,
                'user_id' => $userId,
            ]);
        }
    }
}
