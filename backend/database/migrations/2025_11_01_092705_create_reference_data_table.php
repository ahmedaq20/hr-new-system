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
        Schema::create('reference_data', function (Blueprint $table) {
            $table->id();
            $table->enum('name', [
                'QUALIFICATION',
                'DEPARTMENT',
                'JOB_TITLE',
                'MINISTRY',
                'CLASSIFICATION',
                'CATEGORY',
                'JOB_SCALE',
                'PROGRAM',
                'WORKPLACE',
                'POSITION',
                'ADMINISTRATIVE_TITLE',
                'RETIREMENT_COMMITTEE',
                'CERTIFICATE',
                'DEGREE',
                'DIVISION',
                'SECTION',
                'UNIT',
                'MANAGEMENT_DEPARTMENT',
                'SUB_OFFICE',
                'CROSSING',
                'EMPLOYMENT_STATUS',
                'EMPLOYMENT_TYPE',
                'BANK',
                'CONTRACT',
                'EMPLOYEE_DOCUMENT',
            ]);
            $table->string('value');
            $table->timestamps();

            // Indexes
            $table->index('name');
            $table->unique(['id', 'name', 'value']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reference_data');
    }
};
