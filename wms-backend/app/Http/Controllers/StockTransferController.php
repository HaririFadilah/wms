<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransferRequest;
use App\Http\Resources\StockTransferResource;
use App\Models\StockTransfer;
use App\Services\StockService;
use Illuminate\Http\Request;

class StockTransferController extends Controller
{
    public function __construct(private readonly StockService $stockService) {}

    public function index(Request $request)
    {
        $query = StockTransfer::with(['item.category', 'fromLocation', 'toLocation', 'user']);

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

        return StockTransferResource::collection($query->latest()->paginate($perPage));
    }

    public function store(StoreTransferRequest $request)
    {
        $transfer = $this->stockService->transferStock(
            $request->validated(),
            $request->user()->id,
            $request->ip()
        );

        return response()->json([
            'message' => 'Transfer berhasil.',
            'transfer' => new StockTransferResource($transfer),
        ], 201);
    }
}
