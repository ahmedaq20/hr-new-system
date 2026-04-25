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
        Schema::table('training_participants', function (Blueprint $table) {
            $table->foreignId('training_course_id')->nullable()->change();
            $table->string('manual_course_name')->nullable();
            $table->string('manual_institution')->nullable();
            $table->integer('course_hours')->nullable();
            $table->string('course_date')->nullable(); // MM/YYYY
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('training_participants', function (Blueprint $table) {
            $table->foreignId('training_course_id')->nullable(false)->change();
            $table->dropColumn(['manual_course_name', 'manual_institution', 'course_hours', 'course_date']);
        });
    }
};
