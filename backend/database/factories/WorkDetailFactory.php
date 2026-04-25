<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\ReferenceData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkDetail>
 */
class WorkDetailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'employee_id' => Employee::factory(),

            // 1. البيانات التنظيمية (Organizational Data)
            'ministry_id' => ReferenceData::query()->where('name', 'MINISTRY')->inRandomOrder()->first()?->id,
            'management_department_id' => ReferenceData::query()->where('name', 'MANAGEMENT_DEPARTMENT')->inRandomOrder()->first()?->id,
            'work_department_id' => ReferenceData::query()->where('name', 'DEPARTMENT')->inRandomOrder()->first()?->id,
            'section_id' => ReferenceData::query()->where('name', 'SECTION')->inRandomOrder()->first()?->id,
            'division_id' => ReferenceData::query()->where('name', 'DIVISION')->inRandomOrder()->first()?->id,
            'unit_id' => ReferenceData::query()->where('name', 'UNIT')->inRandomOrder()->first()?->id,
            'crossing_id' => ReferenceData::query()->where('name', 'CROSSING')->inRandomOrder()->first()?->id,
            'sub_office_id' => ReferenceData::query()->where('name', 'SUB_OFFICE')->inRandomOrder()->first()?->id,

            // 2. البيانات الوظيفية (Job Data)
            'job_title_id' => ReferenceData::query()->where('name', 'JOB_TITLE')->inRandomOrder()->first()?->id,
            'employment_status_id' => ReferenceData::query()->where('name', 'EMPLOYMENT_STATUS')->inRandomOrder()->first()?->id,
            'administrative_title_id' => ReferenceData::query()->where('name', 'ADMINISTRATIVE_TITLE')->inRandomOrder()->first()?->id,
            'program_id' => ReferenceData::query()->where('name', 'PROGRAM')->inRandomOrder()->first()?->id,

            // 3. بيانات التصنيف والدرجة (Classification and Grade Data)
            'classification_id' => ReferenceData::query()->where('name', 'CLASSIFICATION')->inRandomOrder()->first()?->id,
            'category_id' => ReferenceData::query()->where('name', 'CATEGORY')->inRandomOrder()->first()?->id,
            'job_scale_id' => ReferenceData::query()->where('name', 'JOB_SCALE')->inRandomOrder()->first()?->id,
            'degree_id' => ReferenceData::query()->where('name', 'DEGREE')->inRandomOrder()->first()?->id,
            'seniority' => $this->faker->numberBetween(1, 15),

            // 4. البيانات المهنية والمؤهلات (Professional Data)
            'certificate_id' => ReferenceData::query()->where('name', 'CERTIFICATE')->inRandomOrder()->first()?->id,
            'actual_service' => $this->faker->numberBetween(0, 30).' سنة',
            'promotion' => $this->faker->numberBetween(0, 5).' ترقية',
            'salary_purposes' => $this->faker->randomElement(['0', '1', '2']),

            // 5. بيانات إدارية إضافية (Additional Administrative Data)
            'fragmentation' => $this->faker->randomFloat(2, 0, 5000),
            'is_supervisory' => $this->faker->boolean(30),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
