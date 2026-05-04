<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'description', 'icon', 'color'])]
class Location extends Model
{
    protected $appends = ['items_count', 'total_stock'];

    public function stocks(): HasMany
    {
        return $this->hasMany(ItemStock::class);
    }

    public function getItemsCountAttribute(): int
    {
        return $this->relationLoaded('stocks')
            ? $this->stocks->where('quantity', '>', 0)->count()
            : $this->stocks()->where('quantity', '>', 0)->count();
    }

    public function getTotalStockAttribute(): int
    {
        return $this->relationLoaded('stocks')
            ? (int) $this->stocks->sum('quantity')
            : (int) $this->stocks()->sum('quantity');
    }
}
