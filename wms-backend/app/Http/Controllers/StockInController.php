<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStockInRequest;
use App\Http\Resources\StockInResource;
use App\Models\StockIn;
use App\Services\StockService;
use Illuminate\Http\Request;

class StockInController extends Controller
{
    public function __construct(private readonly StockService $stockService) {}

    public function index(Request $request)
    {
        $query = StockIn::with(['item.category', 'location', 'user']);

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

        return StockInResource::collection($query->latest()->paginate($perPage));
    }

    public function store(StoreStockInRequest $request)
    {
        $stockIn = $this->stockService->addStock(
            $request->validated(),
            $request->user()->id,
            $request->ip()
        );

        return response()->json([
            'message' => 'Stok masuk berhasil disimpan.',
            'stock_in' => new StockInResource($stockIn),
        ], 201);
    }
}
