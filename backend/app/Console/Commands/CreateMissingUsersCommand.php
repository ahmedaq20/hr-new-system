<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CreateMissingUsersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-missing-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create missing User records for existing Employees to enable login';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $employees = Employee::whereNull('user_id')->get();

        if ($employees->isEmpty()) {
            $this->info('No employees found with missing user accounts.');
            return;
        }

        $this->info("Found {$employees->count()} employees with missing user accounts. Starting generation...");

        $createdCount = 0;
        $linkedCount = 0;

        foreach ($employees as $employee) {
            DB::beginTransaction();
            try {
                // Check if a user with this national_id already exists but isn't linked
                $user = User::where('national_id', $employee->national_id)->first();

                if (!$user) {
                    $user = User::create([
                        'name' => $employee->full_name,
                        'national_id' => $employee->national_id,
                        'email' => $employee->national_id . '@moe.gov.ps',
                        'password' => bcrypt($employee->employee_number ?? ($employee->birth_date ? $employee->birth_date->format('Ymd') : '12345678')),
                    ]);
                    $user->assignRole('employee');
                    $createdCount++;
                } else {
                    $linkedCount++;
                }

                $employee->update(['user_id' => $user->id]);
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $this->error("Failed to process employee #{$employee->id} ({$employee->full_name}): " . $e->getMessage());
            }
        }

        $this->info("Done! Created {$createdCount} new users and linked {$linkedCount} existing users.");
    }
}
