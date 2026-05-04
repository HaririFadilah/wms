<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::query()
            ->where(function ($q) use ($request): void {
                $q->whereNull('user_id')->orWhere('user_id', $request->user()->id);
            });

        $perPage = $request->integer('per_page', 20);

        return NotificationResource::collection($query->latest()->paginate($perPage));
    }

    public function markRead(Request $request, int $id)
    {
        $notification = Notification::query()
            ->where(function ($q) use ($request): void {
                $q->whereNull('user_id')->orWhere('user_id', $request->user()->id);
            })
            ->findOrFail($id);

        $notification->update(['is_read' => true]);

        return new NotificationResource($notification);
    }

    public function readAll(Request $request)
    {
        Notification::query()
            ->where(function ($q) use ($request): void {
                $q->whereNull('user_id')->orWhere('user_id', $request->user()->id);
            })
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Semua notifikasi ditandai dibaca.']);
    }

    public function unreadCount(Request $request)
    {
        $count = Notification::query()
            ->where(function ($q) use ($request): void {
                $q->whereNull('user_id')->orWhere('user_id', $request->user()->id);
            })
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }
}
