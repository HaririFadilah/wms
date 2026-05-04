<?php

namespace App\Http\Controllers;

use App\Models\StockIn;
use App\Services\StockService;
use Illuminate\Http\Request;

class StockInController extends Controller
{
    public function __construct(private readonly StockService $stockService) {}

    public function index()
    {
        return StockIn::with(['item.category', 'location', 'user'])->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'item_id' => ['required', 'exists:items,id'],
            'location_id' => ['required', 'exists:locations,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'supplier' => ['required', 'string', 'max:150'],
            'date' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        return response()->json([
            'message' => 'Stok masuk berhasil disimpan.',
            'stock_in' => $this->stockService->addStock($data, $request->user()->id),
        ], 201);
    }
}
