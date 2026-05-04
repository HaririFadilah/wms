<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['code', 'name', 'category_id', 'unit', 'image', 'minimum_stock'])]
class Item extends Model
{
    protected $appends = ['total_stock', 'status'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(ItemStock::class);
    }

    public function stockIns(): HasMany
    {
        return $this->hasMany(StockIn::class);
    }

    public function stockOuts(): HasMany
    {
        return $this->hasMany(StockOut::class);
    }

    public function transfers(): HasMany
    {
        return $this->hasMany(StockTransfer::class);
    }

    public function getTotalStockAttribute(): int
    {
        return $this->relationLoaded('stocks')
            ? (int) $this->stocks->sum('quantity')
            : (int) $this->stocks()->sum('quantity');
    }

    public function getStatusAttribute(): string
    {
        $total = $this->total_stock;

        if ($total === 0) {
            return 'habis';
        }

        if ($total <= $this->minimum_stock) {
            return 'hampir_habis';
        }

        return 'aman';
    }

    protected static function booted(): void
    {
        static::creating(function (Item $item): void {
            if ($item->code) {
                return;
            }

            $lastId = (int) static::max('id');
            $item->code = 'BRG-'.str_pad((string) ($lastId + 1), 4, '0', STR_PAD_LEFT);
        });
    }
}
