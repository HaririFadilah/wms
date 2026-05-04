<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStockOutRequest;
use App\Http\Resources\StockOutResource;
use App\Models\StockOut;
use App\Services\StockService;
use Illuminate\Http\Request;

class StockOutController extends Controller
{
    public function __construct(private readonly StockService $stockService) {}

    public function index(Request $request)
    {
        $query = StockOut::with(['item.category', 'location', 'user']);

        if ($from = $request->date('from')) {
            $query->whereDate('date', '>=', $from);
        }
        if ($to = $request->date('to')) {
            $query->whereDate('date', '<=', $to);
        }
        if ($itemId = $request->integer('item_id')) {
            $query->where('item_id', $itemId);
        }
        if ($locationId = $request->integer('location_id')) {
            $query->where('location_id', $locationId);
        }

        $perPage = $request->integer('per_page', 20);

        return StockOutResource::collection($query->latest()->paginate($perPage));
    }

    public function store(StoreStockOutRequest $request)
    {
        $stockOut = $this->stockService->removeStock(
            $request->validated(),
            $request->user()->id,
            $request->ip()
        );

        return response()->json([
            'message' => 'Stok keluar berhasil disimpan.',
            'stock_out' => new StockOutResource($stockOut),
        ], 201);
    }
}
