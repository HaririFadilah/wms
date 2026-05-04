<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Item;
use App\Models\ItemStock;
use App\Models\StockAdjustment;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\StockTransfer;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockService
{
    public function __construct(private readonly NotificationService $notifications) {}

    public function addStock(array $data, int $userId, ?string $ip = null): StockIn
    {
        return DB::transaction(function () use ($data, $userId, $ip): StockIn {
            $stockIn = StockIn::create([
                'item_id' => $data['item_id'],
                'location_id' => $data['location_id'],
                'quantity' => $data['quantity'],
                'supplier' => $data['supplier'],
                'date' => $data['date'],
                'note' => $data['note'] ?? null,
                'user_id' => $userId,
            ]);

            $oldQty = $this->getStockQuantity($data['item_id'], $data['location_id']);
            $this->updateStock($data['item_id'], $data['location_id'], $data['quantity']);

            $this->logActivity($userId, 'stock_in', StockIn::class, $stockIn->id,
                "Stok masuk {$data['quantity']} untuk item #{$data['item_id']}.",
                ['old_quantity' => $oldQty, 'new_quantity' => $oldQty + $data['quantity'], 'quantity_added' => $data['quantity']],
                $ip
            );

            $this->checkAndNotify($data['item_id'], $userId);

            return $stockIn->load(['item.category', 'location', 'user']);
        });
    }

    public function removeStock(array $data, int $userId, ?string $ip = null): StockOut
    {
        return DB::transaction(function () use ($data, $userId, $ip): StockOut {
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

            $oldQty = $stock->quantity;
            $this->updateStock($data['item_id'], $data['location_id'], -$data['quantity']);

            $this->logActivity($userId, 'stock_out', StockOut::class, $stockOut->id,
                "Stok keluar {$data['quantity']} untuk item #{$data['item_id']}.",
                ['old_quantity' => $oldQty, 'new_quantity' => $oldQty - $data['quantity'], 'quantity_removed' => $data['quantity']],
                $ip
            );

            $this->checkAndNotify($data['item_id'], $userId);

            return $stockOut->load(['item.category', 'location', 'user']);
        });
    }

    public function transferStock(array $data, int $userId, ?string $ip = null): StockTransfer
    {
        return DB::transaction(function () use ($data, $userId, $ip): StockTransfer {
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

            $this->logActivity($userId, 'transfer', StockTransfer::class, $transfer->id,
                "Transfer {$data['quantity']} item #{$data['item_id']} dari lokasi #{$data['from_location_id']} ke #{$data['to_location_id']}.",
                ['quantity' => $data['quantity'], 'from_location_id' => $data['from_location_id'], 'to_location_id' => $data['to_location_id']],
                $ip
            );

            $this->checkAndNotify($data['item_id'], $userId);

            return $transfer->load(['item.category', 'fromLocation', 'toLocation', 'user']);
        });
    }

    public function adjustStock(array $data, int $userId, ?string $ip = null): StockAdjustment
    {
        return DB::transaction(function () use ($data, $userId, $ip): StockAdjustment {
            $stock = ItemStock::firstOrCreate(
                ['item_id' => $data['item_id'], 'location_id' => $data['location_id']],
                ['quantity' => 0]
            );

            $oldQuantity = $stock->quantity;

            $newQuantity = match ($data['type']) {
                'set' => $data['quantity'],
                'add' => $oldQuantity + $data['quantity'],
                'subtract' => $oldQuantity - $data['quantity'],
            };

            if ($newQuantity < 0) {
                throw ValidationException::withMessages([
                    'quantity' => 'Hasil adjustment tidak boleh negatif. Stok saat ini: '.$oldQuantity,
                ]);
            }

            $stock->update(['quantity' => $newQuantity]);

            $adjustment = StockAdjustment::create([
                'item_id' => $data['item_id'],
                'location_id' => $data['location_id'],
                'type' => $data['type'],
                'quantity' => $data['quantity'],
                'old_quantity' => $oldQuantity,
                'new_quantity' => $newQuantity,
                'reason' => $data['reason'],
                'note' => $data['note'] ?? null,
                'user_id' => $userId,
            ]);

            $this->logActivity($userId, 'stock_adjustment', StockAdjustment::class, $adjustment->id,
                "Adjustment stok item #{$data['item_id']} di lokasi #{$data['location_id']}: {$oldQuantity} → {$newQuantity} ({$data['reason']}).",
                ['type' => $data['type'], 'old_quantity' => $oldQuantity, 'new_quantity' => $newQuantity, 'reason' => $data['reason']],
                $ip
            );

            $this->checkAndNotify($data['item_id'], $userId);

            return $adjustment->load(['item.category', 'location', 'user']);
        });
    }

    private function stockFor(int $itemId, int $locationId): ?ItemStock
    {
        return ItemStock::where('item_id', $itemId)
            ->where('location_id', $locationId)
            ->lockForUpdate()
            ->first();
    }

    private function getStockQuantity(int $itemId, int $locationId): int
    {
        return (int) ItemStock::where('item_id', $itemId)
            ->where('location_id', $locationId)
            ->value('quantity');
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

    private function logActivity(int $userId, string $action, ?string $entityType, ?int $entityId, string $description, ?array $changes = null, ?string $ip = null): void
    {
        ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'description' => $description,
            'changes' => $changes,
            'ip_address' => $ip,
        ]);
    }
}
