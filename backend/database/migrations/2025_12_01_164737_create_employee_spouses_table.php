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
        Schema::create('employee_spouses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')
                ->constrained('employees')
                ->cascadeOnDelete();

            $table->string('full_name'); // اسم الزوج/ة رباعي
            $table->date('marriage_date'); // تاريخ الزواج
            $table->string('spouse_id_number')->nullable(); // رقم هوية الزوج/ة

            $table->string('marital_status'); // وضع أو حالة الزواج

            $table->boolean('is_working')->default(false); // هل يعمل/تعمل الزوج/ة؟
            $table->string('work_sector')->nullable(); // خاص / حكومة / مؤسسة دولية
            $table->string('private_company_name')->nullable(); // اسم الشركة عند "خاص"
            $table->string('international_organization_name')->nullable(); // اسم المؤسسة المدولية

            $table->string('marriage_contract_path')->nullable(); // مرفق عقد الزواج
            $table->string('mobile')->nullable(); // جوال

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_spouses');
    }
};
