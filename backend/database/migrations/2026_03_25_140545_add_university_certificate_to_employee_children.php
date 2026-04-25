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
        Schema::table('employee_children', function (Blueprint $table) {
            $table->string('university_certificate_image')->nullable()->after('birth_certificate_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_children', function (Blueprint $table) {
            $table->dropColumn('university_certificate_image');
        });
    }
};
