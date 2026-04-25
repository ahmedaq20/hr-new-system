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
        Schema::table('work_details', function (Blueprint $table) {
            $table->unsignedBigInteger('employment_type_id')->nullable()->after('employment_status_id')->comment('نوع الموظف');
            $table->foreign('employment_type_id')->references('id')->on('reference_data')->nullOnDelete();
            $table->index('employment_type_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_details', function (Blueprint $table) {
            $table->dropForeign(['employment_type_id']);
            $table->dropIndex(['employment_type_id']);
            $table->dropColumn('employment_type_id');
        });
    }
};
