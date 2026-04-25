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
        Schema::create('training_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_course_id')->constrained('training_courses')->onDelete('cascade');
            $table->string('file_path');
            $table->date('captured_at')->nullable();
            $table->string('caption')->nullable();
            $table->timestamps();
        });

        Schema::create('training_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_course_id')->constrained('training_courses')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->string('file_path');
            $table->date('issued_at')->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->unique(['training_course_id', 'employee_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_certificates');
        Schema::dropIfExists('training_photos');
    }
};
