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
        Schema::table('payslips', function (Blueprint $table) {
            $table->dropUnique('payslips_year_month_unique');
            $table->string('type', 20)->default('master')->after('file_path');
            $table->foreignId('parent_id')->nullable()->after('type')->constrained('payslips')->nullOnDelete();
            $table->foreignId('employee_id')->nullable()->after('parent_id')->constrained()->nullOnDelete();
            $table->string('national_id', 20)->nullable()->after('employee_id');
            $table->unsignedInteger('page_number')->nullable()->after('national_id');

            $table->index(['type', 'year', 'month'], 'payslips_type_year_month_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            $table->dropIndex('payslips_type_year_month_index');
            $table->dropColumn(['page_number', 'national_id']);
            $table->dropConstrainedForeignId('employee_id');
            $table->dropConstrainedForeignId('parent_id');
            $table->dropColumn('type');
            $table->unique(['year', 'month'], 'payslips_year_month_unique');
        });
    }
};
