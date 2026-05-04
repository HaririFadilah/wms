<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockAdjustmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item' => new ItemResource($this->whenLoaded('item')),
            'location' => new LocationResource($this->whenLoaded('location')),
            'type' => $this->type,
            'quantity' => $this->quantity,
            'old_quantity' => $this->old_quantity,
            'new_quantity' => $this->new_quantity,
            'reason' => $this->reason,
            'note' => $this->note,
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
        ];
    }
}
