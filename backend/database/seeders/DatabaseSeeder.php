<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed reference data first (needed for employees)
        $this->call(\Modules\ReferenceDataModule\Database\Seeders\ReferenceDataSeeder::class);

        // Seed governorates and cities
        $this->call(GovernorateSeeder::class);
        $this->call(CitySeeder::class);

        // Seed roles and permissions
        $this->call(RolePermissionSeeder::class);

        $this->call(SuperAdminSeeder::class);
        // Create test users with roles
        // $admin = User::factory()->create([
        //     'name' => 'Admin User',
        //     'national_id' => '900000001',
        //     'email' => 'admin@example.com',
        // ]);
        // $admin->assignRole('admin');

        $officer = User::factory()->create([
            'name' => 'Officer User',
            'national_id' => '900000002',
            'email' => 'officer@example.com',
        ]);
        $officer->assignRole('officer');

        $employee = User::factory()->create([
            'name' => 'Employee User',
            'national_id' => '900000003',
            'email' => 'employee@example.com',
        ]);
        $employee->assignRole('employee');

        // Create a dummy employee record linked to this user
        Employee::factory()->create([
            'user_id' => $employee->id,
            'national_id' => $employee->national_id,
            'employee_number' => 'E-'.$employee->national_id,
            'first_name' => 'Employee',
            'second_name' => 'Test',
            'third_name' => 'User',
            'family_name' => 'Demo',
            'is_active' => true,
            'data_entry_status' => 'approved',
        ]);

        // Seed employees
        $this->call(\Modules\CoreModule\Database\Seeders\CoreDatabaseSeeder::class);

        // $this->call(TempContractProjectSeeder::class);

        // $this->call(TempContractEmployeeSeeder::class);

        // // Run retirement check after all seeders
        // $this->command->info('Checking retirement status...');
        // \Artisan::call('employees:check-retirement');
        // $this->command->info('Retirement status check completed!');

        // $this->call(TrainingCourseSeeder::class);
    }
}
