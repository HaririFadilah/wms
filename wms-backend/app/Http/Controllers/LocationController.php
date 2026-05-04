<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLocationRequest;
use App\Http\Requests\UpdateLocationRequest;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index(Request $request)
    {
        $query = Location::query()->with('stocks');

        if ($search = $request->string('search')->toString()) {
            $query->where('name', 'like', "%{$search}%");
        }

        $perPage = $request->integer('per_page', 20);

        return LocationResource::collection($query->latest()->paginate($perPage));
    }

    public function store(StoreLocationRequest $request)
    {
        return new LocationResource(Location::create($request->validated()));
    }

    public function show(Location $location)
    {
        return new LocationResource($location->load(['stocks.item.category']));
    }

    public function update(UpdateLocationRequest $request, Location $location)
    {
        $location->update($request->validated());

        return new LocationResource($location->refresh());
    }

    public function destroy(Location $location)
    {
        $location->delete();

        return response()->noContent();
    }
}
