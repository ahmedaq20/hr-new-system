<?php

namespace Database\Seeders;

use App\Models\Governorate;
use Illuminate\Database\Seeder;

class GovernorateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $governorates = [
            'محافظة غزة',
            'محافظة الشمال',
            'محافظة الوسطى',
            'محافظة خانيونس',
            'محافظة رفح',
        ];

        foreach ($governorates as $governorate) {
            Governorate::create(['name' => $governorate]);
        }
    }
}
