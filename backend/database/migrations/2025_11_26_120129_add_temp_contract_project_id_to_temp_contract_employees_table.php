<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('temp_contract_employees', function (Blueprint $table) {
            $table->foreignId('temp_contract_project_id')
                ->after('id')
                ->nullable()
                ->constrained('temp_contract_projects')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('temp_contract_employees', function (Blueprint $table) {
            $table->dropForeign(['temp_contract_project_id']);
            $table->dropColumn('temp_contract_project_id');
        });
    }
};
