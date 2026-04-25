<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('temp_contract_employees', function (Blueprint $table) {
            $table->id();
            $table->string('first_name')->nullable();
            $table->string('second_name')->nullable();
            $table->string('third_name')->nullable();
            $table->string('family_name')->nullable();
            // Generated column: full_name (handles NULL values)
            $driver = DB::getDriverName();
            if ($driver === 'pgsql' || $driver === 'sqlite') {
                // PostgreSQL: only supports stored generated columns, uses || for concatenation
                $table->string('full_name')->nullable()->storedAs(DB::raw("TRIM(COALESCE(first_name || ' ', '') || COALESCE(second_name || ' ', '') || COALESCE(third_name || ' ', '') || COALESCE(family_name, ''))"));
            } else {
                // MySQL/MariaDB: supports virtual generated columns, uses CONCAT function
                $table->string('full_name')->nullable()->virtualAs('CONCAT(COALESCE(first_name, ""), " ", COALESCE(second_name, ""), " ", COALESCE(third_name, ""), " ", COALESCE(family_name, ""))');
            }
            $table->string('national_id')->nullable();
            $table->string('primary_phone')->nullable();
            $table->string('secondary_phone')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->enum('marital_status', ['married', 'single', 'divorced', 'widowed'])->nullable();
            $table->date('birth_date')->nullable();
            $table->string('position_type')->nullable();
            $table->date('start_contract_date')->nullable();
            $table->date('end_contract_date')->nullable();

            // Address Information
            $table->foreignId('governorate_id')->nullable()->constrained('governorates')->onDelete('set null');
            $table->foreignId('city_id')->nullable()->constrained('cities')->onDelete('set null');
            $table->string('address')->nullable();

            $table->unsignedBigInteger('certificate_id')->nullable()->comment('الشهادة');
            $table->string('university_name')->nullable();
            $table->string('major_name')->nullable();
            $table->date('graduation_date')->nullable();

            $table->boolean('is_active')->default(true);
            $table->string('data_entry_status')->default('draft')->comment('draft, pending_review, approved');
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->softDeletes();

            // Indexes
            $table->index('governorate_id');
            $table->index('city_id');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('temp_contract_employees');
    }
};
