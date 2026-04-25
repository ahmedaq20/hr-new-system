<?php

namespace Modules\CoreModule\Database\Seeders;

use App\Models\Employee;
use App\Models\ReferenceData;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use ReflectionClass;
use Spatie\Permission\Models\Role;
use Modules\CoreModule\Services\PasswordGeneratorService;

class CreateUsersForEligibleEmployeesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates user accounts for all employees who are:
     * - على رأس عمله (active employment status)
     * - رسمي (official) OR عقد تشغيل (contract) employment type
     */
    public function run(): void
    {
        // Get the employment_status_id for "على رأس عمله" using LIKE pattern
        $activeStatusIds = ReferenceData::where('name', 'EMPLOYMENT_STATUS')
            ->where('value', 'LIKE', 'على رأس عمله%')
            ->pluck('id')
            ->toArray();

        // Get the employment_type_ids for "رسمي" OR "عقد تشغيل" using slugs
        $eligibleTypeIds = ReferenceData::where('name', 'EMPLOYMENT_TYPE')
            ->whereIn('slug', ['employment_type.official', 'employment_type.contract'])
            ->pluck('id')
            ->toArray();

        if (empty($activeStatusIds) || empty($eligibleTypeIds)) {
            $this->command->warn('Reference data not set up. Skipping user creation.');

            return;
        }

        // Get or create the employee role
        $employeeRole = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'api']);

        // Get password generator service
        $passwordService = app(PasswordGeneratorService::class);
        $passwordService->useRandomPasswords(); // Enable random password generation

        // Find all eligible employees (على رأس عمله & (رسمي OR عقد تشغيل))
        $eligibleEmployees = Employee::query()
            ->whereHas('workDetail', function ($query) use ($activeStatusIds, $eligibleTypeIds) {
                $query->whereIn('employment_status_id', $activeStatusIds)
                    ->whereIn('employment_type_id', $eligibleTypeIds);
            })
            ->whereNotNull('national_id')
            ->whereNull('user_id')
            ->get();

        $totalCount = $eligibleEmployees->count();
        $this->command->info("Found {$totalCount} eligible employees without user accounts.");

        if ($totalCount === 0) {
            return;
        }

        $created = 0;
        $linked = 0;
        $passwordEntries = [];

        $progressBar = $this->command->getOutput()->createProgressBar($totalCount);
        $progressBar->start();

        foreach ($eligibleEmployees as $employee) {
            // Skip if a user with this national_id already exists
            $existingUser = User::where('national_id', $employee->national_id)->first();

            if ($existingUser) {
                // Link the existing user to the employee
                $employee->update(['user_id' => $existingUser->id]);
                $linked++;
                $progressBar->advance();

                continue;
            }

            // Generate password
            $passwordData = $passwordService->generate();

            // Create a new user for the employee
            $user = User::create([
                'name' => $employee->full_name,
                'national_id' => $employee->national_id,
                'email' => $employee->national_id.'@employee.local',
                'password' => $passwordData['hashed'],
            ]);

            // Assign employee role
            $user->assignRole($employeeRole);

            // Link the user to the employee
            $employee->update(['user_id' => $user->id]);

            // Collect password data for batch Excel writing
            $phoneNumber = $employee->primary_phone ?? $employee->secondary_phone ?? null;
            $passwordEntries[] = [
                'phone_number' => $phoneNumber ?: '',
                'password' => $passwordData['plain'],
                'full_name' => $employee->full_name,
                'national_id' => $employee->national_id,
            ];

            $created++;
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->command->newLine();

        // Write all passwords to Excel in one batch
        if (! empty($passwordEntries)) {
            $this->command->info('Writing passwords to Excel file...');
            $this->writePasswordsToExcel($passwordService, $passwordEntries);
        }

        $this->command->info("Created {$created} new user accounts.");
        $this->command->info("Linked {$linked} existing user accounts to employees.");

        // Make national ID 901645838 an admin
        $adminUser = User::where('national_id', '901645838')->first();
        if ($adminUser) {
            $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
            if (! $adminUser->hasRole('admin')) {
                $adminUser->assignRole($adminRole);
                $this->command->info('Assigned admin role to user with national ID: 901645838');
            }
        } else {
            $this->command->warn('User with national ID 901645838 not found. Cannot assign admin role.');
        }

        // Display Excel file path if passwords were generated
        $excelPath = $passwordService->getExcelFilePath();
        if ($excelPath && file_exists($excelPath)) {
            $this->command->info('');
            $this->command->info('═══════════════════════════════════════════════════════════');
            $this->command->info('Employee passwords Excel file created:');
            $this->command->info($excelPath);
            $this->command->info('═══════════════════════════════════════════════════════════');
        }
    }

    /**
     * Write all password entries to Excel in a single batch operation.
     *
     * @param  array<int, array{phone_number: string, password: string, full_name: string, national_id: string}>  $entries
     */
    private function writePasswordsToExcel(PasswordGeneratorService $passwordService, array $entries): void
    {
        // Initialize Excel file path if not set
        $excelFilePath = $passwordService->getExcelFilePath();
        if ($excelFilePath === null) {
            $excelFilePath = storage_path('app/employee_passwords_'.date('Y-m-d_His').'.xlsx');
        }

        try {
            $spreadsheet = new Spreadsheet;
            $worksheet = $spreadsheet->getActiveSheet();

            // Set headers
            $worksheet->setCellValue('A1', 'الاسم الكامل');
            $worksheet->setCellValue('B1', 'رقم الهوية');
            $worksheet->setCellValue('C1', 'كلمة المرور');
            $worksheet->setCellValue('D1', 'رقم الجوال');

            // Style headers
            $worksheet->getStyle('A1:D1')->getFont()->setBold(true);
            $worksheet->getColumnDimension('A')->setWidth(30);
            $worksheet->getColumnDimension('B')->setWidth(15);
            $worksheet->getColumnDimension('C')->setWidth(15);
            $worksheet->getColumnDimension('D')->setWidth(15);

            // Write all entries
            $row = 2;
            foreach ($entries as $entry) {
                $worksheet->setCellValue('A'.$row, $entry['full_name']);
                $worksheet->setCellValue('B'.$row, $entry['national_id']);
                $worksheet->setCellValue('C'.$row, $entry['password']);
                $worksheet->setCellValue('D'.$row, $entry['phone_number'] ?: '-');
                $row++;
            }

            // Save file
            $writer = new Xlsx($spreadsheet);
            $writer->save($excelFilePath);

            // Update the service's file path
            $reflection = new ReflectionClass($passwordService);
            $property = $reflection->getProperty('excelFilePath');
            $property->setAccessible(true);
            $property->setValue($passwordService, $excelFilePath);
        } catch (\Exception $e) {
            Log::error('Failed to write passwords to Excel: '.$e->getMessage());
            $this->command->error('Failed to write passwords to Excel: '.$e->getMessage());
        }
    }
}

