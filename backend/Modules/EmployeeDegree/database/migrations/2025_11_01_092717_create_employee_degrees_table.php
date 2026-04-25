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
        Schema::create('employee_degrees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->nullable()->constrained('employees')->onDelete('cascade');
            $table->foreignId('qualification_id')->nullable()->constrained('reference_data')->onDelete('set null');
            $table->string('major_name')->nullable();
            $table->string('university_name')->nullable();
            $table->year('graduation_year')->nullable();
            $table->string('document_path')->nullable();
            $table->string('grade')->nullable();
            $table->string('certificate_attachment')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('employee_id');
            $table->index('qualification_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_degrees');
    }
};
