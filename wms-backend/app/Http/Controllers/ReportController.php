<?php

namespace App\Http\Controllers;

use App\Http\Resources\ItemResource;
use App\Http\Resources\StockInResource;
use App\Http\Resources\StockOutResource;
use App\Http\Resources\StockTransferResource;
use App\Models\Item;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\StockTransfer;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function stock(Request $request)
    {
        $query = Item::with(['category', 'stocks.location']);

        if ($categoryId = $request->integer('category_id')) {
            $query->where('category_id', $categoryId);
        }
        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%");
            });
        }

        return ItemResource::collection($query->orderBy('name')->paginate($request->integer('per_page', 50)));
    }

    public function stockIn(Request $request)
    {
        $query = StockIn::with(['item.category', 'location', 'user']);

        $this->applyDateFilters($query, $request, 'date');
        $this->applyItemLocationFilters($query, $request);

        return StockInResource::collection($query->latest()->paginate($request->integer('per_page', 50)));
    }

    public function stockOut(Request $request)
    {
        $query = StockOut::with(['item.category', 'location', 'user']);

        $this->applyDateFilters($query, $request, 'date');
        $this->applyItemLocationFilters($query, $request);

        return StockOutResource::collection($query->latest()->paginate($request->integer('per_page', 50)));
    }

    public function transfers(Request $request)
    {
        $query = StockTransfer::with(['item.category', 'fromLocation', 'toLocation', 'user']);

        $this->applyDateFilters($query, $request, 'created_at');
        if ($itemId = $request->integer('item_id')) {
            $query->where('item_id', $itemId);
        }

        return StockTransferResource::collection($query->latest()->paginate($request->integer('per_page', 50)));
    }

    public function lowStock(Request $request)
    {
        $items = Item::with(['category', 'stocks.location'])->get()
            ->filter(fn (Item $item): bool => in_array($item->status, ['habis', 'hampir_habis'], true))
            ->values();

        return ItemResource::collection($items);
    }

    public function exportExcel(string $type, Request $request)
    {
        return response()->json([
            'message' => 'Export Excel siap dihubungkan ke package spreadsheet.',
            'type' => $type,
            'data' => $this->reportData($type, $request),
        ]);
    }

    public function exportPdf(string $type, Request $request)
    {
        return response()->json([
            'message' => 'Export PDF siap dihubungkan ke package PDF.',
            'type' => $type,
            'data' => $this->reportData($type, $request),
        ]);
    }

    private function applyDateFilters($query, Request $request, string $column): void
    {
        if ($from = $request->date('from')) {
            $query->whereDate($column, '>=', $from);
        }
        if ($to = $request->date('to')) {
            $query->whereDate($column, '<=', $to);
        }
    }

    private function applyItemLocationFilters($query, Request $request): void
    {
        if ($itemId = $request->integer('item_id')) {
            $query->where('item_id', $itemId);
        }
        if ($locationId = $request->integer('location_id')) {
            $query->where('location_id', $locationId);
        }
    }

    private function reportData(string $type, Request $request)
    {
        return match ($type) {
            'stock-in' => $this->stockIn($request),
            'stock-out' => $this->stockOut($request),
            'transfers' => $this->transfers($request),
            'low-stock' => $this->lowStock($request),
            default => $this->stock($request),
        };
    }
}
