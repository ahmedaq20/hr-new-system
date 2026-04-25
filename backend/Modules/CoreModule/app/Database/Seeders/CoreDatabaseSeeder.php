<?php

namespace Modules\CoreModule\Database\Seeders;

use Illuminate\Database\Seeder;

class CoreDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call(ImportEmployeesFromExcelSeeder::class);
        $this->call(ImportPayslipsSeeder::class);
        $this->call(CreateUsersForEligibleEmployeesSeeder::class);
    }
}
