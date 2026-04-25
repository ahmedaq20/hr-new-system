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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('action', [
                // Authentication
                'login',
                'logout',
                'failed_login',

                // Employee Operations
                'created_employee',
                'updated_employee',
                'deleted_employee',
                'searched_employees',
                'exported_employees',

                // Document Operations
                'printed_employee_report',
                'printed_payroll',
                'downloaded_document',
                'uploaded_document',
                'deleted_document',

                // Family & Degrees
                'added_family_member',
                'updated_family_member',
                'deleted_family_member',
                'added_degree',
                'updated_degree',
                'deleted_degree',

                // System
                'changed_password',
            ]);
            $table->longText('details')->nullable();
            $table->unsignedBigInteger('loggable_id')->nullable();
            $table->string('loggable_type')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('browser')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index(['loggable_id', 'loggable_type']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
