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
        Schema::create('employee_dependents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')
                ->constrained('employees')
                ->cascadeOnDelete();

            $table->string('full_name'); // اسم المعال رباعي
            $table->string('dependent_id_number')->nullable(); // هوية المعال
            $table->date('birth_date')->nullable(); // تاريخ ميلاد المعال
            $table->string('mobile')->nullable(); // رقم الجوال
            $table->string('relationship')->nullable(); // صلة القرابة
            $table->text('address')->nullable(); // السكن/العنوان
            $table->enum('gender', ['ذكر', 'أنثى'])->nullable(); // الجنس
            $table->text('notes')->nullable(); // ملاحظات - اختياري
            $table->string('dependency_proof_path')->nullable(); // مرفقات (حجة الاعالة) - اختياري

            // Approval fields
            $table->enum('approval_status', ['approved', 'pending', 'rejected'])
                ->default('pending')
                ->comment('حالة الموافقة على البيانات');

            $table->foreignId('submitted_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->comment('المستخدم الذي أضاف/عدّل البيانات');

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->comment('المشرف الذي وافق على البيانات');

            $table->timestamp('approved_at')
                ->nullable()
                ->comment('تاريخ الموافقة');

            $table->text('rejection_reason')
                ->nullable()
                ->comment('سبب الرفض');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_dependents');
    }
};