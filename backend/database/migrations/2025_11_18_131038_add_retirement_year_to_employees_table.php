<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Artisan;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // No migration needed - retirement year is calculated from birth_date
        // Run retirement check after migration
        Artisan::call('employees:check-retirement');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No migration needed - retirement year is calculated from birth_date
    }
};
