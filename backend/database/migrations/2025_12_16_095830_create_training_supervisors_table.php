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
        Schema::create('training_supervisors', function (Blueprint $table) {
            $table->id();

            $table->foreignId('training_course_id')
                ->constrained('training_courses')
                ->cascadeOnDelete();

            // If supervisor is an employee
            $table->foreignId('employee_id')
                ->nullable()
                ->constrained('employees')
                ->nullOnDelete();

            // If supervisor is external (not from employees table)
            $table->boolean('is_external')->default(false);
            $table->string('external_name')->nullable();
            $table->text('external_experience')->nullable();
            $table->text('external_contact_method')->nullable(); // Flexible text field for any contact info
            $table->text('external_notes')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('training_course_id');
            $table->index('employee_id');
            $table->index('is_external');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_supervisors');
    }
};
