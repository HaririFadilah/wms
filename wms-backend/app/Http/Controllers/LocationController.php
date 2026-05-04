<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index()
    {
        return Location::query()->with('stocks')->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:locations,name'],
            'description' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:30'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        return response()->json(Location::create($data), 201);
    }

    public function show(Location $location)
    {
        return $location->load(['stocks.item.category']);
    }

    public function update(Request $request, Location $location)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100', 'unique:locations,name,'.$location->id],
            'description' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:30'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $location->update($data);

        return $location->refresh();
    }

    public function destroy(Location $location)
    {
        $location->delete();

        return response()->noContent();
    }
}
