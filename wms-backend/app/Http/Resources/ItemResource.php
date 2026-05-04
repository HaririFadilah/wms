<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'unit' => $this->unit,
            'image' => $this->image,
            'minimum_stock' => $this->minimum_stock,
            'total_stock' => $this->total_stock,
            'status' => $this->status,
            'stocks' => ItemStockResource::collection($this->whenLoaded('stocks')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
