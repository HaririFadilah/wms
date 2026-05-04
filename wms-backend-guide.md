# WMS — Laravel 13 Backend Structure

## Struktur Folder
```
wms-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── ItemController.php
│   │   │   ├── CategoryController.php
│   │   │   ├── LocationController.php
│   │   │   ├── StockInController.php
│   │   │   ├── StockOutController.php
│   │   │   ├── StockTransferController.php
│   │   │   ├── NotificationController.php
│   │   │   ├── ReportController.php
│   │   │   └── DashboardController.php
│   │   └── Middleware/
│   │       ├── RoleMiddleware.php
│   │       └── Authenticate.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Category.php
│   │   ├── Location.php
│   │   ├── Item.php
│   │   ├── ItemStock.php
│   │   ├── StockIn.php
│   │   ├── StockOut.php
│   │   ├── StockTransfer.php
│   │   ├── Notification.php
│   │   └── ActivityLog.php
│   └── Services/
│       ├── StockService.php
│       ├── NotificationService.php
│       └── ExportService.php
├── database/
│   └── migrations/
│       ├── 2024_01_01_000001_create_users_table.php
│       ├── 2024_01_01_000002_create_categories_table.php
│       ├── 2024_01_01_000003_create_locations_table.php
│       ├── 2024_01_01_000004_create_items_table.php
│       ├── 2024_01_01_000005_create_item_stocks_table.php
│       ├── 2024_01_01_000006_create_stock_ins_table.php
│       ├── 2024_01_01_000007_create_stock_outs_table.php
│       ├── 2024_01_01_000008_create_stock_transfers_table.php
│       ├── 2024_01_01_000009_create_notifications_table.php
│       └── 2024_01_01_000010_create_activity_logs_table.php
└── routes/
    └── api.php
```

---

## routes/api.php
```php
<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController, ItemController, CategoryController,
    LocationController, StockInController, StockOutController,
    StockTransferController, NotificationController, ReportController, DashboardController
};

// Public
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('locations', LocationController::class);
    Route::apiResource('items', ItemController::class);
    Route::get('/items/{item}/stocks', [ItemController::class, 'stocks']);

    Route::middleware('role:admin,staff')->group(function () {
        Route::apiResource('stock-ins', StockInController::class)->only(['index','store']);
        Route::apiResource('stock-outs', StockOutController::class)->only(['index','store']);
        Route::get('/transfers', [StockTransferController::class, 'index']);
        Route::post('/transfers', [StockTransferController::class, 'store']);
    });

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll']);

    Route::get('/reports/stock', [ReportController::class, 'stock']);
    Route::get('/reports/stock-in', [ReportController::class, 'stockIn']);
    Route::get('/reports/stock-out', [ReportController::class, 'stockOut']);
    Route::get('/reports/transfers', [ReportController::class, 'transfers']);
    Route::get('/reports/low-stock', [ReportController::class, 'lowStock']);
    Route::get('/export/excel/{type}', [ReportController::class, 'exportExcel']);
    Route::get('/export/pdf/{type}', [ReportController::class, 'exportPdf']);
});
```

---

## app/Services/StockService.php
```php
<?php
namespace App\Services;

use App\Models\{Item, ItemStock, StockIn, StockOut, StockTransfer, ActivityLog};
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockService
{
    public function addStock(array $data, int $userId): StockIn
    {
        return DB::transaction(function () use ($data, $userId) {
            $stockIn = StockIn::create([
                'item_id'     => $data['item_id'],
                'location_id' => $data['location_id'],
                'quantity'    => $data['quantity'],
                'supplier'    => $data['supplier'],
                'date'        => $data['date'],
                'note'        => $data['note'] ?? null,
                'user_id'     => $userId,
            ]);

            $this->updateStock($data['item_id'], $data['location_id'], $data['quantity']);
            $this->logActivity($userId, 'stock_in', "Stok masuk {$data['quantity']} unit untuk item #{$data['item_id']}");
            $this->checkAndNotify($data['item_id'], $userId);

            return $stockIn;
        });
    }

    public function removeStock(array $data, int $userId): StockOut
    {
        return DB::transaction(function () use ($data, $userId) {
            $stock = ItemStock::where('item_id', $data['item_id'])
                ->where('location_id', $data['location_id'])
                ->first();

            if (!$stock || $stock->quantity < $data['quantity']) {
                throw ValidationException::withMessages([
                    'quantity' => 'Stok tidak mencukupi di lokasi yang dipilih.',
                ]);
            }

            $stockOut = StockOut::create([
                'item_id'     => $data['item_id'],
                'location_id' => $data['location_id'],
                'quantity'    => $data['quantity'],
                'purpose'     => $data['purpose'],
                'date'        => $data['date'],
                'note'        => $data['note'] ?? null,
                'user_id'     => $userId,
            ]);

            $this->updateStock($data['item_id'], $data['location_id'], -$data['quantity']);
            $this->logActivity($userId, 'stock_out', "Stok keluar {$data['quantity']} unit item #{$data['item_id']}");
            $this->checkAndNotify($data['item_id'], $userId);

            return $stockOut;
        });
    }

    public function transferStock(array $data, int $userId): StockTransfer
    {
        return DB::transaction(function () use ($data, $userId) {
            if ($data['from_location_id'] === $data['to_location_id']) {
                throw ValidationException::withMessages([
                    'to_location_id' => 'Lokasi asal dan tujuan tidak boleh sama.',
                ]);
            }

            $fromStock = ItemStock::where('item_id', $data['item_id'])
                ->where('location_id', $data['from_location_id'])
                ->first();

            if (!$fromStock || $fromStock->quantity < $data['quantity']) {
                throw ValidationException::withMessages([
                    'quantity' => "Stok tidak mencukupi. Tersedia: " . ($fromStock->quantity ?? 0),
                ]);
            }

            $transfer = StockTransfer::create([
                'item_id'          => $data['item_id'],
                'from_location_id' => $data['from_location_id'],
                'to_location_id'   => $data['to_location_id'],
                'quantity'         => $data['quantity'],
                'note'             => $data['note'] ?? null,
                'user_id'          => $userId,
            ]);

            $this->updateStock($data['item_id'], $data['from_location_id'], -$data['quantity']);
            $this->updateStock($data['item_id'], $data['to_location_id'], $data['quantity']);

            $this->logActivity($userId, 'transfer',
                "Transfer {$data['quantity']} unit item #{$data['item_id']} dari lokasi #{$data['from_location_id']} ke #{$data['to_location_id']}"
            );

            $this->checkAndNotify($data['item_id'], $userId);

            return $transfer;
        });
    }

    private function updateStock(int $itemId, int $locationId, int $delta): void
    {
        $stock = ItemStock::firstOrCreate(
            ['item_id' => $itemId, 'location_id' => $locationId],
            ['quantity' => 0]
        );
        $stock->increment('quantity', $delta);
    }

    private function checkAndNotify(int $itemId, int $userId): void
    {
        $item = Item::with('stocks')->find($itemId);
        $totalStock = $item->stocks->sum('quantity');

        if ($totalStock === 0) {
            $this->createNotification($userId, 'danger', 'Stok Habis',
                "Stok {$item->name} habis di semua lokasi."
            );
        } elseif ($totalStock <= $item->minimum_stock) {
            $this->createNotification($userId, 'warning', 'Stok Hampir Habis',
                "Stok {$item->name} hampir habis. Sisa: {$totalStock} {$item->unit}."
            );
        }
    }

    private function createNotification(int $userId, string $type, string $title, string $message): void
    {
        \App\Models\Notification::create([
            'user_id' => $userId,
            'type'    => $type,
            'title'   => $title,
            'message' => $message,
            'is_read' => false,
        ]);
    }

    private function logActivity(int $userId, string $action, string $description): void
    {
        ActivityLog::create([
            'user_id'     => $userId,
            'action'      => $action,
            'description' => $description,
        ]);
    }
}
```

---

## app/Http/Controllers/StockTransferController.php
```php
<?php
namespace App\Http\Controllers;

use App\Services\StockService;
use Illuminate\Http\Request;

class StockTransferController extends Controller
{
    public function __construct(private StockService $stockService) {}

    public function index(Request $request)
    {
        $transfers = \App\Models\StockTransfer::with(['item', 'fromLocation', 'toLocation', 'user'])
            ->latest()->paginate(20);
        return response()->json($transfers);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'item_id'          => 'required|exists:items,id',
            'from_location_id' => 'required|exists:locations,id',
            'to_location_id'   => 'required|exists:locations,id|different:from_location_id',
            'quantity'         => 'required|integer|min:1',
            'note'             => 'nullable|string|max:500',
        ]);

        $transfer = $this->stockService->transferStock($data, $request->user()->id);

        return response()->json([
            'message'  => 'Transfer berhasil.',
            'transfer' => $transfer->load(['item', 'fromLocation', 'toLocation']),
        ], 201);
    }
}
```

---

## database/migrations (Key Migrations)

### items table
```php
Schema::create('items', function (Blueprint $table) {
    $table->id();
    $table->string('code')->unique();
    $table->string('name');
    $table->foreignId('category_id')->constrained()->cascadeOnDelete();
    $table->string('unit');
    $table->string('image')->nullable();
    $table->integer('minimum_stock')->default(0);
    $table->timestamps();
});
```

### item_stocks table
```php
Schema::create('item_stocks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('item_id')->constrained()->cascadeOnDelete();
    $table->foreignId('location_id')->constrained()->cascadeOnDelete();
    $table->integer('quantity')->default(0);
    $table->unique(['item_id', 'location_id']);
    $table->timestamps();
});
```

### stock_transfers table
```php
Schema::create('stock_transfers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('item_id')->constrained();
    $table->foreignId('from_location_id')->constrained('locations');
    $table->foreignId('to_location_id')->constrained('locations');
    $table->integer('quantity');
    $table->text('note')->nullable();
    $table->foreignId('user_id')->constrained();
    $table->timestamps();
});
```

---

## Item Model (Status Accessor)
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $appends = ['total_stock', 'status'];

    public function stocks()    { return $this->hasMany(ItemStock::class); }
    public function category()  { return $this->belongsTo(Category::class); }

    public function getTotalStockAttribute(): int
    {
        return $this->stocks->sum('quantity');
    }

    public function getStatusAttribute(): string
    {
        $total = $this->total_stock;
        if ($total === 0)              return 'habis';
        if ($total <= $this->minimum_stock) return 'hampir_habis';
        return 'aman';
    }

    // Auto-generate code
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($item) {
            $last = static::latest('id')->first();
            $item->code = 'BRG-' . str_pad(($last ? $last->id + 1 : 1), 4, '0', STR_PAD_LEFT);
        });
    }
}
```
