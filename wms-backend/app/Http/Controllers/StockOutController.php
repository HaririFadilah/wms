<?php

namespace App\Http\Controllers;

use App\Models\StockOut;
use App\Services\StockService;
use Illuminate\Http\Request;

class StockOutController extends Controller
{
    public function __construct(private readonly StockService $stockService) {}

    public function index()
    {
        return StockOut::with(['item.category', 'location', 'user'])->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'item_id' => ['required', 'exists:items,id'],
            'location_id' => ['required', 'exists:locations,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'purpose' => ['required', 'string', 'max:150'],
            'date' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        return response()->json([
            'message' => 'Stok keluar berhasil disimpan.',
            'stock_out' => $this->stockService->removeStock($data, $request->user()->id),
        ], 201);
    }
}
