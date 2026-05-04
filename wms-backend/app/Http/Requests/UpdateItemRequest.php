<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['sometimes', 'required', 'string', 'max:50', 'unique:items,code,'.$this->route('item')->id],
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'category_id' => ['sometimes', 'required', 'exists:categories,id'],
            'unit' => ['sometimes', 'required', 'string', 'max:30'],
            'image' => ['nullable', 'string', 'max:255'],
            'minimum_stock' => ['sometimes', 'required', 'integer', 'min:0'],
        ];
    }
}
