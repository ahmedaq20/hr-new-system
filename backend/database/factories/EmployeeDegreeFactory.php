<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\ReferenceData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmployeeDegree>
 */
class EmployeeDegreeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Gaza & Palestinian Universities
        $universities = [
            'الجامعة الإسلامية - غزة',
            'جامعة الأزهر - غزة',
            'جامعة الأقصى',
            'جامعة فلسطين',
            'كلية فلسطين التقنية - دير البلح',
            'جامعة القدس المفتوحة',
            'جامعة بيرزيت',
            'جامعة النجاح الوطنية',
            'جامعة بوليتكنك فلسطين',
            'جامعة الخليل',
        ];

        // Academic Majors in Arabic
        $majors = [
            'علوم الحاسوب',
            'هندسة البرمجيات',
            'إدارة الأعمال',
            'المحاسبة',
            'القانون',
            'الطب البشري',
            'الهندسة المدنية',
            'الهندسة الكهربائية',
            'الصيدلة',
            'العلوم السياسية',
            'التربية',
            'اللغة العربية',
            'اللغة الإنجليزية',
            'الإعلام والاتصال',
            'الشريعة والقانون',
        ];

        return [
            'employee_id' => Employee::factory(),
            'qualification_id' => ReferenceData::where('name', 'qualification')->inRandomOrder()->first()?->id,
            'major_name' => $this->faker->randomElement($majors),
            'university_name' => $this->faker->randomElement($universities),
            'graduation_date' => $this->faker->date('Y-m-d', '-5 years'),
            'document_path' => $this->faker->filePath(),
        ];
    }
}
