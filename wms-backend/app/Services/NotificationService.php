<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    public function create(?int $userId, string $type, string $title, string $message): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'is_read' => false,
        ]);
    }
}
