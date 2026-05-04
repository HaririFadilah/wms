<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        return Notification::query()
            ->where(function ($query) use ($request): void {
                $query->whereNull('user_id')->orWhere('user_id', $request->user()->id);
            })
            ->latest()
            ->get();
    }

    public function markRead(Request $request, int $id)
    {
        $notification = Notification::query()
            ->where(function ($query) use ($request): void {
                $query->whereNull('user_id')->orWhere('user_id', $request->user()->id);
            })
            ->findOrFail($id);

        $notification->update(['is_read' => true]);

        return $notification;
    }

    public function readAll(Request $request)
    {
        Notification::query()
            ->where(function ($query) use ($request): void {
                $query->whereNull('user_id')->orWhere('user_id', $request->user()->id);
            })
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Semua notifikasi ditandai dibaca.']);
    }
}
