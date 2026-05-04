<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['item_id', 'location_id', 'quantity', 'supplier', 'date', 'note', 'user_id'])]
class StockIn extends Model
{
    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    public function item(): BelongsTo { return $this->belongsTo(Item::class); }
    public function location(): BelongsTo { return $this->belongsTo(Location::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
