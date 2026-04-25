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
        Schema::create('training_courses', function (Blueprint $table) {
            $table->id();

            // نوع الدورة/الورشة (Training Type) - Reference Data
            $table->foreignId('training_type_id')
                ->nullable()
                ->constrained('reference_data')
                ->nullOnDelete();

            // تصنيف الدورة/الورشة (Training Classification) - Reference Data
            $table->foreignId('training_classification_id')
                ->nullable()
                ->constrained('reference_data')
                ->nullOnDelete();

            // اسم الدورة/الورشة (Course/Workshop Name)
            $table->string('name');

            // الفئة المستهدفة (Target Audience)
            $table->string('target_audience')->nullable();

            // الجهة الممولة (Funding Entity)
            $table->string('funding_entity')->nullable();

            // مدة الدورة (Course Duration)
            $table->string('duration')->nullable();

            // آلية الانعقاد (Implementation Mechanism)
            $table->string('implementation_mechanism')->nullable();

            // محتوى الدورة (Course Content)
            $table->text('content')->nullable();

            // مكان الانعقاد (Location)
            $table->string('location')->nullable();

            // تفاصيل أخرى (Other Details)
            $table->text('other_details')->nullable();

            // تواريخ
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('training_type_id');
            $table->index('training_classification_id');
            $table->index('is_active');
            $table->index('start_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_courses');
    }
};
