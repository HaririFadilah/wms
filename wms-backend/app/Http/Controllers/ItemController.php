<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $query = Item::query()->with(['category', 'stocks.location']);

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->integer('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $items = $query->latest()->get();

        if ($status = $request->string('status')->toString()) {
            $items = $items->filter(fn (Item $item): bool => $item->status === $status)->values();
        }

        return $items;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => ['nullable', 'string', 'max:50', 'unique:items,code'],
            'name' => ['required', 'string', 'max:150'],
            'category_id' => ['required', 'exists:categories,id'],
            'unit' => ['required', 'string', 'max:30'],
            'image' => ['nullable', 'string', 'max:255'],
            'minimum_stock' => ['required', 'integer', 'min:0'],
        ]);

        return response()->json(Item::create($data)->load(['category', 'stocks.location']), 201);
    }

    public function show(Item $item)
    {
        return $item->load(['category', 'stocks.location']);
    }

    public function update(Request $request, Item $item)
    {
        $data = $request->validate([
            'code' => ['sometimes', 'required', 'string', 'max:50', 'unique:items,code,'.$item->id],
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'category_id' => ['sometimes', 'required', 'exists:categories,id'],
            'unit' => ['sometimes', 'required', 'string', 'max:30'],
            'image' => ['nullable', 'string', 'max:255'],
            'minimum_stock' => ['sometimes', 'required', 'integer', 'min:0'],
        ]);

        $item->update($data);

        return $item->load(['category', 'stocks.location']);
    }

    public function destroy(Item $item)
    {
        $item->delete();

        return response()->noContent();
    }

    public function stocks(Item $item)
    {
        return $item->stocks()->with('location')->get();
    }
}
