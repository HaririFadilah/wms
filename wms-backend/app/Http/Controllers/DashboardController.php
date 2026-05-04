<?php

namespace App\Http\Controllers;

use App\Http\Resources\ItemResource;
use App\Http\Resources\StockInResource;
use App\Http\Resources\StockOutResource;
use App\Http\Resources\StockTransferResource;
use App\Models\Category;
use App\Models\Item;
use App\Models\Location;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\StockTransfer;
use Illuminate\Support\Carbon;

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
            'stock_flow' => $this->stockFlow(),
            'location_distribution' => Location::with('stocks')->get()->map(fn (Location $location): array => [
                'id' => $location->id,
                'name' => $location->name,
                'total_stock' => $location->total_stock,
                'color' => $location->color,
            ]),
            'recent_transfers' => StockTransferResource::collection(
                StockTransfer::with(['item', 'fromLocation', 'toLocation', 'user'])->latest()->limit(5)->get()
            ),
            'stock_alerts' => ItemResource::collection(
                $items->filter(fn (Item $item): bool => in_array($item->status, ['habis', 'hampir_habis'], true))->values()
            ),
            'recent_stock_in' => StockInResource::collection(
                StockIn::with(['item', 'location', 'user'])->latest()->limit(5)->get()
            ),
            'recent_stock_out' => StockOutResource::collection(
                StockOut::with(['item', 'location', 'user'])->latest()->limit(5)->get()
            ),
        ];
    }

    private function stockFlow(): array
    {
        $months = collect(range(5, 0))->map(fn (int $i) => Carbon::now()->subMonths($i));

        $labels = $months->map(fn (Carbon $d) => $d->translatedFormat('M Y'))->values()->all();

        $inData = $months->map(fn (Carbon $d) => (int) StockIn::whereYear('date', $d->year)->whereMonth('date', $d->month)->sum('quantity'))->values()->all();

        $outData = $months->map(fn (Carbon $d) => (int) StockOut::whereYear('date', $d->year)->whereMonth('date', $d->month)->sum('quantity'))->values()->all();

        return [
            'labels' => $labels,
            'in' => $inData,
            'out' => $outData,
        ];
    }
}
