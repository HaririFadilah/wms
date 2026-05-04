<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockTransferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item' => new ItemResource($this->whenLoaded('item')),
            'from_location' => new LocationResource($this->whenLoaded('fromLocation')),
            'to_location' => new LocationResource($this->whenLoaded('toLocation')),
            'quantity' => $this->quantity,
            'note' => $this->note,
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
        ];
    }
}
