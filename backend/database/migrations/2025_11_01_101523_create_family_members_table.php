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
        Schema::create('family_members', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('national_id')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->enum('marital_status', ['married', 'single', 'divorced', 'widowed'])->nullable();
            $table->enum('relationship_type', ['spouse', 'child', 'parent', 'sibling', 'other'])->nullable();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();

            // Index
            $table->index('employee_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_members');
    }
};
