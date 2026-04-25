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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();

            // Personal Information
            $table->string('first_name');
            $table->string('second_name');
            $table->string('third_name');
            $table->string('family_name');
            // Generated column: full_name
            $driver = DB::getDriverName();
            if ($driver === 'pgsql' || $driver === 'sqlite') {
                // PostgreSQL: only supports stored generated columns, uses || for concatenation
                $table->string('full_name')->storedAs(DB::raw("first_name || ' ' || second_name || ' ' || third_name || ' ' || family_name"));
            } else {
                // MySQL/MariaDB: supports virtual generated columns, uses CONCAT function
                $table->string('full_name')->virtualAs('CONCAT(first_name, " ", second_name, " ", third_name, " ", family_name)');
            }
            $table->string('employee_number')->unique()->nullable();
            $table->date('birth_date')->nullable();
            $table->boolean('is_alive')->default(true);
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->enum('marital_status', ['married', 'single', 'divorced', 'widowed'])->nullable();
            $table->string('primary_phone')->nullable();
            $table->string('secondary_phone')->nullable();

            // Address Information
            $table->foreignId('governorate_id')->nullable()->constrained('governorates')->onDelete('set null');
            $table->foreignId('city_id')->nullable()->constrained('cities')->onDelete('set null');
            $table->text('address')->nullable();

            // Work Information
            $table->date('date_of_appointment')->nullable();

            // Bank Information
            $table->foreignId('bank_id')->nullable()->constrained('reference_data')->onDelete('set null');
            $table->string('bank_account_number')->nullable();
            $table->string('bank_iban')->nullable();

            // System & Relations
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');

            // Status & Metadata
            $table->boolean('is_active')->default(true);
            $table->string('data_entry_status')->default('draft')->comment('draft, pending_review, approved');

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('user_id');
            $table->index('governorate_id');
            $table->index('city_id');
            $table->index('bank_id');
            $table->index('is_active');
            $table->index('is_alive');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
