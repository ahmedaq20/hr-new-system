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
        Schema::create('training_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_course_id')->constrained('training_courses')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->date('attendance_date');
            $table->time('check_in_at')->nullable();
            $table->time('check_out_at')->nullable();
            $table->string('workplace')->nullable();
            $table->text('notes')->nullable();
            $table->string('source')->default('manual');
            $table->timestamps();

            $table->unique(['training_course_id', 'employee_id', 'attendance_date'], 'unique_course_employee_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_attendances');
    }
};
