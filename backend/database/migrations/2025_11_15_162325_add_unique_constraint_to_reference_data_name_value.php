<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, remove any duplicate entries (keep the first one)
        $duplicates = DB::table('reference_data')
            ->select('name', 'value', DB::raw('COUNT(*) as count'))
            ->groupBy('name', 'value')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $duplicate) {
            $ids = DB::table('reference_data')
                ->where('name', $duplicate->name)
                ->where('value', $duplicate->value)
                ->orderBy('id')
                ->pluck('id')
                ->toArray();

            // Keep the first one, delete the rest
            if (count($ids) > 1) {
                $idsToDelete = array_slice($ids, 1);
                DB::table('reference_data')
                    ->whereIn('id', $idsToDelete)
                    ->delete();
            }
        }

        // Remove the existing unique constraint if it exists (the one with id)
        Schema::table('reference_data', function (Blueprint $table) {
            $table->dropUnique(['id', 'name', 'value']);
        });

        // Add unique constraint on name and value only
        Schema::table('reference_data', function (Blueprint $table) {
            $table->unique(['name', 'value'], 'reference_data_name_value_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reference_data', function (Blueprint $table) {
            $table->dropUnique('reference_data_name_value_unique');
        });

        // Restore the original unique constraint
        Schema::table('reference_data', function (Blueprint $table) {
            $table->unique(['id', 'name', 'value']);
        });
    }
};
