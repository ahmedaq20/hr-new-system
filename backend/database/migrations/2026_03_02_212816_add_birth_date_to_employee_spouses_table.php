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
        Schema::table('employee_spouses', function (Blueprint $table) {
            $table->date('birth_date')->nullable()->after('full_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_spouses', function (Blueprint $table) {
            $table->dropColumn('birth_date');
        });
    }
};
