<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StockAdjustmentController;
use App\Http\Controllers\StockInController;
use App\Http\Controllers\StockOutController;
use App\Http\Controllers\StockTransferController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('locations', LocationController::class);
    Route::apiResource('items', ItemController::class);
    Route::get('/items/{item}/stocks', [ItemController::class, 'stocks']);

    Route::middleware('role:admin,staff')->group(function (): void {
        Route::apiResource('stock-ins', StockInController::class)->only(['index', 'store']);
        Route::apiResource('stock-outs', StockOutController::class)->only(['index', 'store']);
        Route::get('/transfers', [StockTransferController::class, 'index']);
        Route::post('/transfers', [StockTransferController::class, 'store']);
        Route::get('/stock-adjustments', [StockAdjustmentController::class, 'index']);
        Route::post('/stock-adjustments', [StockAdjustmentController::class, 'store']);
    });

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll']);

    Route::get('/reports/stock', [ReportController::class, 'stock']);
    Route::get('/reports/stock-in', [ReportController::class, 'stockIn']);
    Route::get('/reports/stock-out', [ReportController::class, 'stockOut']);
    Route::get('/reports/transfers', [ReportController::class, 'transfers']);
    Route::get('/reports/low-stock', [ReportController::class, 'lowStock']);
    Route::get('/export/excel/{type}', [ReportController::class, 'exportExcel']);
    Route::get('/export/pdf/{type}', [ReportController::class, 'exportPdf']);
});
