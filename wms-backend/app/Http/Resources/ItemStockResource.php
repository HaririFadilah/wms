<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemStockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item_id' => $this->item_id,
            'location_id' => $this->location_id,
            'quantity' => $this->quantity,
            'location' => new LocationResource($this->whenLoaded('location')),
            'item' => new ItemResource($this->whenLoaded('item')),
        ];
    }
}
