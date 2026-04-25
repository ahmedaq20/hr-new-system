<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_children', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->string('full_name');
            $table->enum('gender', ['ذكر', 'أنثى']);
            $table->string('id_number')->nullable();
            $table->date('birth_date');
            $table->string('marital_status')->nullable();
            $table->boolean('is_working')->default(false);
            $table->boolean('is_university_student')->default(false);
            $table->text('notes')->nullable();
            $table->string('id_card_image')->nullable();
            $table->string('birth_certificate_image')->nullable();
            $table->string('mother_full_name');
            $table->string('mother_id_number');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_children');
    }
};
