<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Item;
use App\Models\ItemStock;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\StockTransfer;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockService
{
    public function __construct(private readonly NotificationService $notifications) {}

    public function addStock(array $data, int $userId): StockIn
    {
        return DB::transaction(function () use ($data, $userId): StockIn {
            $stockIn = StockIn::create([
                'item_id' => $data['item_id'],
                'location_id' => $data['location_id'],
                'quantity' => $data['quantity'],
                'supplier' => $data['supplier'],
                'date' => $data['date'],
                'note' => $data['note'] ?? null,
                'user_id' => $userId,
            ]);

            $this->updateStock($data['item_id'], $data['location_id'], $data['quantity']);
            $this->logActivity($userId, 'stock_in', "Stok masuk {$data['quantity']} untuk item #{$data['item_id']}.");
            $this->checkAndNotify($data['item_id'], $userId);

            return $stockIn->load(['item.category', 'location', 'user']);
        });
    }

    public function removeStock(array $data, int $userId): StockOut
    {
        return DB::transaction(function () use ($data, $userId): StockOut {
            $stock = $this->stockFor($data['item_id'], $data['location_id']);

            if (! $stock || $stock->quantity < $data['quantity']) {
                throw ValidationException::withMessages([
                    'quantity' => 'Stok tidak mencukupi di lokasi yang dipilih.',
                ]);
            }

            $stockOut = StockOut::create([
                'item_id' => $data['item_id'],
                'location_id' => $data['location_id'],
                'quantity' => $data['quantity'],
                'purpose' => $data['purpose'],
                'date' => $data['date'],
                'note' => $data['note'] ?? null,
                'user_id' => $userId,
            ]);

            $this->updateStock($data['item_id'], $data['location_id'], -$data['quantity']);
            $this->logActivity($userId, 'stock_out', "Stok keluar {$data['quantity']} untuk item #{$data['item_id']}.");
            $this->checkAndNotify($data['item_id'], $userId);

            return $stockOut->load(['item.category', 'location', 'user']);
        });
    }

    public function transferStock(array $data, int $userId): StockTransfer
    {
        return DB::transaction(function () use ($data, $userId): StockTransfer {
            if ((int) $data['from_location_id'] === (int) $data['to_location_id']) {
                throw ValidationException::withMessages([
                    'to_location_id' => 'Lokasi asal dan tujuan tidak boleh sama.',
                ]);
            }

            $fromStock = $this->stockFor($data['item_id'], $data['from_location_id']);

            if (! $fromStock || $fromStock->quantity < $data['quantity']) {
                throw ValidationException::withMessages([
                    'quantity' => 'Stok tidak mencukupi. Tersedia: '.($fromStock->quantity ?? 0),
                ]);
            }

            $transfer = StockTransfer::create([
                'item_id' => $data['item_id'],
                'from_location_id' => $data['from_location_id'],
                'to_location_id' => $data['to_location_id'],
                'quantity' => $data['quantity'],
                'note' => $data['note'] ?? null,
                'user_id' => $userId,
            ]);

            $this->updateStock($data['item_id'], $data['from_location_id'], -$data['quantity']);
            $this->updateStock($data['item_id'], $data['to_location_id'], $data['quantity']);
            $this->logActivity($userId, 'transfer', "Transfer {$data['quantity']} item #{$data['item_id']} dari lokasi #{$data['from_location_id']} ke #{$data['to_location_id']}.");
            $this->checkAndNotify($data['item_id'], $userId);

            return $transfer->load(['item.category', 'fromLocation', 'toLocation', 'user']);
        });
    }

    private function stockFor(int $itemId, int $locationId): ?ItemStock
    {
        return ItemStock::where('item_id', $itemId)
            ->where('location_id', $locationId)
            ->lockForUpdate()
            ->first();
    }

    private function updateStock(int $itemId, int $locationId, int $delta): void
    {
        $stock = ItemStock::firstOrCreate(
            ['item_id' => $itemId, 'location_id' => $locationId],
            ['quantity' => 0]
        );

        $stock->quantity += $delta;
        $stock->save();
    }

    private function checkAndNotify(int $itemId, int $userId): void
    {
        $item = Item::with('stocks')->findOrFail($itemId);
        $totalStock = $item->stocks->sum('quantity');

        if ($totalStock === 0) {
            $this->notifications->create($userId, 'danger', 'Stok Habis', "Stok {$item->name} habis di semua lokasi.");
        } elseif ($totalStock <= $item->minimum_stock) {
            $this->notifications->create($userId, 'warning', 'Stok Hampir Habis', "Stok {$item->name} hampir habis. Sisa: {$totalStock} {$item->unit}.");
        }
    }

    private function logActivity(int $userId, string $action, string $description): void
    {
        ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
        ]);
    }
}
