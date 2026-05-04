<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activity_logs', function (Blueprint $table): void {
            $table->string('entity_type')->nullable()->after('action');
            $table->unsignedBigInteger('entity_id')->nullable()->after('entity_type');
            $table->json('changes')->nullable()->after('description');
            $table->string('ip_address')->nullable()->after('changes');
            $table->index(['entity_type', 'entity_id']);
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table): void {
            $table->dropIndex(['entity_type', 'entity_id']);
            $table->dropIndex(['action']);
            $table->dropIndex(['created_at']);
            $table->dropColumn(['entity_type', 'entity_id', 'changes', 'ip_address']);
        });
    }
};
