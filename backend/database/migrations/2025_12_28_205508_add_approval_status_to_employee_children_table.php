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
        Schema::table('employee_children', function (Blueprint $table) {
            $table->enum('approval_status', ['approved', 'pending', 'rejected'])
                ->default('approved')
                ->after('mother_id_number')
                ->comment('حالة الموافقة على البيانات');

            $table->foreignId('submitted_by')
                ->nullable()
                ->after('approval_status')
                ->constrained('users')
                ->nullOnDelete()
                ->comment('المستخدم الذي أضاف/عدّل البيانات');

            $table->foreignId('approved_by')
                ->nullable()
                ->after('submitted_by')
                ->constrained('users')
                ->nullOnDelete()
                ->comment('المشرف الذي وافق على البيانات');

            $table->timestamp('approved_at')
                ->nullable()
                ->after('approved_by')
                ->comment('تاريخ الموافقة');

            $table->text('rejection_reason')
                ->nullable()
                ->after('approved_at')
                ->comment('سبب الرفض');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_children', function (Blueprint $table) {
            $table->dropForeign(['submitted_by']);
            $table->dropForeign(['approved_by']);
            $table->dropColumn([
                'approval_status',
                'submitted_by',
                'approved_by',
                'approved_at',
                'rejection_reason',
            ]);
        });
    }
};
