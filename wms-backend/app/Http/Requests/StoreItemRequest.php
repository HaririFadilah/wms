<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['nullable', 'string', 'max:50', 'unique:items,code'],
            'name' => ['required', 'string', 'max:150'],
            'category_id' => ['required', 'exists:categories,id'],
            'unit' => ['required', 'string', 'max:30'],
            'image' => ['nullable', 'string', 'max:255'],
            'minimum_stock' => ['required', 'integer', 'min:0'],
        ];
    }
}
