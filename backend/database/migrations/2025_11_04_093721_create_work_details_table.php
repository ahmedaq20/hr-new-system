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
        Schema::create('work_details', function (Blueprint $table) {
            $table->id();

            // Employee Reference
            $table->unsignedBigInteger('employee_id')->comment('معرف الموظف');

            // ============================================
            // 1. البيانات التنظيمية (المستوى الإداري)
            //    Organizational Data (Administrative Level)
            // ============================================

            // الوزارة (Ministry)
            $table->unsignedBigInteger('ministry_id')->nullable()->comment('الوزارة');

            // الإدارة العامة (Management Department)
            $table->unsignedBigInteger('management_department_id')->nullable()->comment('الإدارة العامة');

            // الدائرة (Department)
            $table->unsignedBigInteger('work_department_id')->nullable()->comment('الدائرة');

            // القسم (Section)
            $table->unsignedBigInteger('section_id')->nullable()->comment('القسم');

            // الشعبة (Division)
            $table->unsignedBigInteger('division_id')->nullable()->comment('الشعبة');

            // الوحدة (Unit)
            $table->unsignedBigInteger('unit_id')->nullable()->comment('الوحدة');

            // المعبر (Crossing)
            $table->unsignedBigInteger('crossing_id')->nullable()->comment('المعبر');

            // المكاتب الفرعية (Sub-offices)
            $table->unsignedBigInteger('sub_office_id')->nullable()->comment('المكتب الفرعي');

            // ============================================
            // 2. البيانات الوظيفية
            //    Job Data
            // ============================================

            // المسمى الوظيفي (Job Title)
            $table->unsignedBigInteger('job_title_id')->nullable()->comment('المسمى الوظيفي');

            // حالة التوظيف (Employment Status)
            $table->unsignedBigInteger('employment_status_id')->nullable()->comment('حالة التوظيف');

            // البرنامج (Program)
            $table->unsignedBigInteger('program_id')->nullable()->comment('البرنامج');

            // ============================================
            // 3. بيانات التصنيف والدرجة
            //    Classification and Grade Data
            // ============================================

            // التصنيف (Classification)
            $table->unsignedBigInteger('classification_id')->nullable()->comment('التصنيف');

            // الفئة (Category)
            $table->unsignedBigInteger('category_id')->nullable()->comment('الفئة');

            // السلم الوظيفي (Job Scale)
            $table->unsignedBigInteger('job_scale_id')->nullable()->comment('السلم الوظيفي');

            // الدرجة الوظيفية (Degree)
            $table->unsignedBigInteger('degree_id')->nullable()->comment('الدرجة الوظيفية');

            // الأقدمية (Seniority)
            $table->string('seniority')->nullable()->comment('الأقدمية');

            // ============================================
            // 4. البيانات المهنية والمؤهلات
            //    Professional Data and Qualifications
            // ============================================

            // الشهادة (Certificate)
            $table->unsignedBigInteger('certificate_id')->nullable()->comment('الشهادة');

            // خدمة فعلية (Actual Service)
            $table->string('actual_service')->nullable()->comment('خدمة فعلية');

            // ترقية (Promotion)
            $table->string('promotion')->nullable()->comment('ترقية');

            // لأغراض الراتب (For Salary Purposes)
            $table->string('salary_purposes')->nullable()->comment('لأغراض الراتب');

            // ============================================
            // 5. بيانات إدارية إضافية
            //    Additional Administrative Data
            // ============================================
            // التجزئة (Fragmentation)
            $table->integer('fragmentation')->nullable()->default(1000)->comment('التجزئة');

            // هل يقوم الموظف بعمل إشرافي (Supervisory Work)
            $table->boolean('is_supervisory')->default(false)->comment('هل يقوم الموظف بعمل إشرافي');

            // ملاحظات (Notes)
            $table->text('notes')->nullable()->comment('ملاحظات');

            $table->timestamps();
            $table->softDeletes();

            // Foreign Key Constraints
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
            $table->foreign('ministry_id')->references('id')->on('reference_data')->onDelete('set null');
            $table->foreign('management_department_id')->references('id')->on('reference_data')->onDelete('set null');
            $table->foreign('work_department_id')->references('id')->on('reference_data')->onDelete('set null');
            $table->foreign('section_id')->references('id')->on('reference_data')->onDelete('set null');
            $table->foreign('division_id')->references('id')->on('reference_data')->onDelete('set null');
            $table->foreign('unit_id')->references('id')->on('reference_data')->onDelete('set null');
            $table->foreign('crossing_id')->references('id')->on('reference_data')->onDelete('set null');
            $table->foreign('sub_office_id')->references('id')->on('reference_data')->onDelete('set null');
            $table->foreign('job_title_id')->references('id')->on('reference_data')->onDelete('set null');
            $table->foreign('employment_status_id')->references('id')->on('reference_data')->onDelete('set null');
            $table->foreign('program_id')->references('id')->on('reference_data')->onDelete('set null');
            $table->foreign('classification_id')->references('id')->on('reference_data')->onDelete('set null');
            $table->foreign('category_id')->references('id')->on('reference_data')->onDelete('set null');
            $table->foreign('job_scale_id')->references('id')->on('reference_data')->onDelete('set null');
            $table->foreign('degree_id')->references('id')->on('reference_data')->onDelete('set null');
            $table->foreign('certificate_id')->references('id')->on('reference_data')->onDelete('set null');

            // Indexes
            $table->index('employee_id');
            $table->index('ministry_id');
            $table->index('classification_id');
            $table->index('category_id');
            $table->index('degree_id');
            $table->index('is_supervisory');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_details');
    }
};
