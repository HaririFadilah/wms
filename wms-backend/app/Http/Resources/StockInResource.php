<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockInResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item' => new ItemResource($this->whenLoaded('item')),
            'location' => new LocationResource($this->whenLoaded('location')),
            'quantity' => $this->quantity,
            'supplier' => $this->supplier,
            'date' => $this->date?->format('Y-m-d'),
            'note' => $this->note,
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
        ];
    }
}
