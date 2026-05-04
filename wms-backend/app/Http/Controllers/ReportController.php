<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\StockTransfer;

class ReportController extends Controller
{
    public function stock()
    {
        return Item::with(['category', 'stocks.location'])->orderBy('name')->get();
    }

    public function stockIn()
    {
        return StockIn::with(['item.category', 'location', 'user'])->latest()->get();
    }

    public function stockOut()
    {
        return StockOut::with(['item.category', 'location', 'user'])->latest()->get();
    }

    public function transfers()
    {
        return StockTransfer::with(['item.category', 'fromLocation', 'toLocation', 'user'])->latest()->get();
    }

    public function lowStock()
    {
        return Item::with(['category', 'stocks.location'])->get()
            ->filter(fn (Item $item): bool => in_array($item->status, ['habis', 'hampir_habis'], true))
            ->values();
    }

    public function exportExcel(string $type)
    {
        return response()->json([
            'message' => 'Export Excel siap dihubungkan ke package spreadsheet.',
            'type' => $type,
            'data' => $this->reportData($type),
        ]);
    }

    public function exportPdf(string $type)
    {
        return response()->json([
            'message' => 'Export PDF siap dihubungkan ke package PDF.',
            'type' => $type,
            'data' => $this->reportData($type),
        ]);
    }

    private function reportData(string $type)
    {
        return match ($type) {
            'stock-in' => $this->stockIn(),
            'stock-out' => $this->stockOut(),
            'transfers' => $this->transfers(),
            'low-stock' => $this->lowStock(),
            default => $this->stock(),
        };
    }
}
