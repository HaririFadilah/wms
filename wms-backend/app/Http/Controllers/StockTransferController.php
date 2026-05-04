<?php

namespace App\Http\Controllers;

use App\Models\StockTransfer;
use App\Services\StockService;
use Illuminate\Http\Request;

class StockTransferController extends Controller
{
    public function __construct(private readonly StockService $stockService) {}

    public function index()
    {
        return StockTransfer::with(['item.category', 'fromLocation', 'toLocation', 'user'])->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'item_id' => ['required', 'exists:items,id'],
            'from_location_id' => ['required', 'exists:locations,id'],
            'to_location_id' => ['required', 'exists:locations,id', 'different:from_location_id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        return response()->json([
            'message' => 'Transfer berhasil.',
            'transfer' => $this->stockService->transferStock($data, $request->user()->id),
        ], 201);
    }
}
