<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'item_id' => ['required', 'exists:items,id'],
            'location_id' => ['required', 'exists:locations,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'supplier' => ['required', 'string', 'max:150'],
            'date' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
