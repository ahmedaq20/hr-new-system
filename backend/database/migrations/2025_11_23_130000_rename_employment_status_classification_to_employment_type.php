<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Rename reference_data entries
        DB::table('reference_data')
            ->where('name', 'EMPLOYMENT_STATUS_CLASSIFICATION')
            ->update(['name' => 'EMPLOYMENT_TYPE']);

        // Update config-driven names (handled via seeder when run)

        if (Schema::hasColumn('work_details', 'employment_status_classification_id')) {
            Schema::table('work_details', function (Blueprint $table) {
                $table->dropForeign(['employment_status_classification_id']);
                $table->dropIndex(['employment_status_classification_id']);
            });

            Schema::table('work_details', function (Blueprint $table) {
                $table->renameColumn('employment_status_classification_id', 'employment_type_id');
            });

            Schema::table('work_details', function (Blueprint $table) {
                $table->foreign('employment_type_id')
                    ->references('id')
                    ->on('reference_data')
                    ->nullOnDelete();
                $table->index('employment_type_id');
            });
        }
    }

    public function down(): void
    {
        // Revert reference_data names
        DB::table('reference_data')
            ->where('name', 'EMPLOYMENT_TYPE')
            ->update(['name' => 'EMPLOYMENT_STATUS_CLASSIFICATION']);

        if (Schema::hasColumn('work_details', 'employment_type_id')) {
            Schema::table('work_details', function (Blueprint $table) {
                $table->dropForeign(['employment_type_id']);
                $table->dropIndex(['employment_type_id']);
            });

            Schema::table('work_details', function (Blueprint $table) {
                $table->renameColumn('employment_type_id', 'employment_status_classification_id');
            });

            Schema::table('work_details', function (Blueprint $table) {
                $table->foreign('employment_status_classification_id')
                    ->references('id')
                    ->on('reference_data')
                    ->nullOnDelete();
                $table->index('employment_status_classification_id');
            });
        }
    }
};
