<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'description' => $this->description,
            'entity_type' => $this->entity_type,
            'entity_id' => $this->entity_id,
            'changes' => $this->changes,
            'ip_address' => $this->ip_address,
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
        ];
    }
}
