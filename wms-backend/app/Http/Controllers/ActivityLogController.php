<?php

namespace App\Http\Controllers;

use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user');

        if ($action = $request->string('action')->toString()) {
            $query->where('action', $action);
        }
        if ($from = $request->date('from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->date('to')) {
            $query->whereDate('created_at', '<=', $to);
        }
        if ($userId = $request->integer('user_id')) {
            $query->where('user_id', $userId);
        }

        $perPage = $request->integer('per_page', 20);

        return ActivityLogResource::collection($query->latest()->paginate($perPage));
    }
}
