<?php

namespace Database\Seeders;

use App\Models\TempContractEmployee;
use Illuminate\Database\Seeder;

class TempContractEmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        TempContractEmployee::updateOrCreate(
            ['national_id' => '404024127'],
            [
                'temp_contract_project_id' => 1, // المشروع البلجيكي
                'first_name' => 'حسام',
                'second_name' => 'حاتم',
                'third_name' => 'حلمي',
                'family_name' => 'حرز',
                'national_id' => '404024127',
                'primary_phone' => '0597043176',
                'secondary_phone' => '0599753449',
                'gender' => 'male',
                'marital_status' => 'single',
                'birth_date' => '1998-02-22',
                'position_type' => 'Full Stack Web Developer',
                'start_contract_date' => '2025-10-20',
                'end_contract_date' => '2025-02-20',
                'governorate_id' => 1, // محافظة غزة
                'city_id' => 1, // مدينة غزة
                'address' => 'شارع اليرموك بجوار مسجد التابعين',
                'certificate_id' => 23, // بكالوريوس
                'university_name' => 'جامعة الأزهر - غزة',
                'major_name' => 'هندسة أنظمة الحاسوب',
                'graduation_date' => '2021-06-01',
                'is_active' => true,
                'data_entry_status' => 'approved',
            ]
        );
    }
}
