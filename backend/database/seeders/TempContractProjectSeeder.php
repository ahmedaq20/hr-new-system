<?php

namespace Database\Seeders;

use App\Models\TempContractProject;
use Illuminate\Database\Seeder;

class TempContractProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = [
            [
                'name' => 'المشروع البلجيكي',
                'duration' => '4 شهور',
                'start_date' => '2025-10-20',
                'end_date' => '2025-02-20',
                'funding_source' => 'صندوق التشغيل الفلسطيني',
                'description' => 'تم تشغيل موظفين بعقود مؤقتة من خلال صندوق التشغيل الفلسطيني من خلال المشروع البلجيكي',
            ],
            [
                'name' => 'المشروع الألماني',
                'duration' => '4 شهور',
                'start_date' => '2025-11-01',
                'end_date' => '2025-03-01',
                'funding_source' => 'صندوق التشغيل الفلسطيني',
                'description' => 'تم تشغيل موظفين بعقود مؤقتة من خلال صندوق التشغيل الفلسطيني من خلال المشروع الألماني',
            ],
        ];

        foreach ($projects as $project) {
            TempContractProject::updateOrCreate(['name' => $project['name']], $project);
        }
    }
}
