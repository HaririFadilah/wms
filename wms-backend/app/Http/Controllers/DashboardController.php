<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Item;
use App\Models\Location;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\StockTransfer;

class DashboardController extends Controller
{
    public function index()
    {
        $items = Item::with(['category', 'stocks.location'])->get();

        return [
            'stats' => [
                'total_items' => $items->count(),
                'total_categories' => Category::count(),
                'total_locations' => Location::count(),
                'total_stock' => $items->sum('total_stock'),
                'low_stock' => $items->where('status', 'hampir_habis')->count(),
                'out_of_stock' => $items->where('status', 'habis')->count(),
            ],
            'stock_flow' => [
                'labels' => ['Jan', 'Feb', 'Mar', 'Apr', 'Mei'],
                'in' => [320, 410, 390, 520, 480],
                'out' => [240, 300, 280, 380, 350],
            ],
            'location_distribution' => Location::with('stocks')->get()->map(fn (Location $location): array => [
                'id' => $location->id,
                'name' => $location->name,
                'total_stock' => $location->total_stock,
                'color' => $location->color,
            ]),
            'recent_transfers' => StockTransfer::with(['item', 'fromLocation', 'toLocation'])->latest()->limit(5)->get(),
            'stock_alerts' => $items->filter(fn (Item $item): bool => in_array($item->status, ['habis', 'hampir_habis'], true))->values(),
            'recent_stock_in' => StockIn::with(['item', 'location'])->latest()->limit(5)->get(),
            'recent_stock_out' => StockOut::with(['item', 'location'])->latest()->limit(5)->get(),
        ];
    }
}
