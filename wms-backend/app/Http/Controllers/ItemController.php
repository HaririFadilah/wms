<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Http\Resources\ItemResource;
use App\Http\Resources\ItemStockResource;
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

        $perPage = $request->integer('per_page', 20);
        $items = $query->latest()->paginate($perPage);

        if ($status = $request->string('status')->toString()) {
            $filtered = $items->getCollection()->filter(fn (Item $item): bool => $item->status === $status)->values();
            $items->setCollection($filtered);
        }

        return ItemResource::collection($items);
    }

    public function store(StoreItemRequest $request)
    {
        $item = Item::create($request->validated());

        return new ItemResource($item->load(['category', 'stocks.location']));
    }

    public function show(Item $item)
    {
        return new ItemResource($item->load(['category', 'stocks.location']));
    }

    public function update(UpdateItemRequest $request, Item $item)
    {
        $item->update($request->validated());

        return new ItemResource($item->load(['category', 'stocks.location']));
    }

    public function destroy(Item $item)
    {
        $item->delete();

        return response()->noContent();
    }

    public function stocks(Item $item)
    {
        return ItemStockResource::collection($item->stocks()->with('location')->get());
    }
}
