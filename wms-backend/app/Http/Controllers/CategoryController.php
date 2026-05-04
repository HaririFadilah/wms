<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::query()->withCount('items');

        if ($search = $request->string('search')->toString()) {
            $query->where('name', 'like', "%{$search}%");
        }

        $perPage = $request->integer('per_page', 20);

        return CategoryResource::collection($query->latest()->paginate($perPage));
    }

    public function store(StoreCategoryRequest $request)
    {
        $category = Category::create($request->validated());

        return new CategoryResource($category);
    }

    public function show(Category $category)
    {
        return new CategoryResource($category->load('items.stocks.location'));
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return new CategoryResource($category->refresh());
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->noContent();
    }
}
