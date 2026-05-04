<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStockAdjustmentRequest;
use App\Http\Resources\StockAdjustmentResource;
use App\Models\StockAdjustment;
use App\Services\StockService;
use Illuminate\Http\Request;

class StockAdjustmentController extends Controller
{
    public function __construct(private readonly StockService $stockService) {}

    public function index(Request $request)
    {
        $query = StockAdjustment::with(['item.category', 'location', 'user']);

        if ($from = $request->date('from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->date('to')) {
            $query->whereDate('created_at', '<=', $to);
        }
        if ($itemId = $request->integer('item_id')) {
            $query->where('item_id', $itemId);
        }

        $perPage = $request->integer('per_page', 20);

        return StockAdjustmentResource::collection($query->latest()->paginate($perPage));
    }

    public function store(StoreStockAdjustmentRequest $request)
    {
        $adjustment = $this->stockService->adjustStock(
            $request->validated(),
            $request->user()->id,
            $request->ip()
        );

        return response()->json([
            'message' => 'Adjustment stok berhasil.',
            'adjustment' => new StockAdjustmentResource($adjustment),
        ], 201);
    }
}
