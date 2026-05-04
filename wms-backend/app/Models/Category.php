<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'description', 'icon'])]
class Category extends Model
{
    protected $appends = ['items_count'];

    public function items(): HasMany
    {
        return $this->hasMany(Item::class);
    }

    public function getItemsCountAttribute(): int
    {
        if (array_key_exists('items_count', $this->attributes)) {
            return (int) $this->attributes['items_count'];
        }

        return $this->relationLoaded('items')
            ? $this->items->count()
            : $this->items()->count();
    }
}
