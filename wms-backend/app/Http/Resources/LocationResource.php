<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'icon' => $this->icon,
            'color' => $this->color,
            'items_count' => $this->items_count,
            'total_stock' => $this->total_stock,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
