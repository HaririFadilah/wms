<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', 'unique:locations,name'],
            'description' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:30'],
            'color' => ['nullable', 'string', 'max:20'],
        ];
    }
}
