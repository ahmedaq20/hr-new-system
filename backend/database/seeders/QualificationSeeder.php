<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QualificationSeeder extends Seeder
{
    public function run()
    {
        DB::table('reference_data')->insert([
            ['name' => 'QUALIFICATION', 'value' => 'Bachelor', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'QUALIFICATION', 'value' => 'Master', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'QUALIFICATION', 'value' => 'PhD', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
