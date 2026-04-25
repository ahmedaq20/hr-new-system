<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Models\ReferenceData;
use App\Models\WorkDetail;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckRetirementStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'employees:check-retirement';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and mark employees as retired based on birth_date + 60 years';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking retirement status...');

        $retiredStatus = ReferenceData::where('slug', 'employment_status.retired')
            ->orWhere(function ($query) {
                $query->where('name', 'EMPLOYMENT_STATUS')
                    ->where('value', 'متقاعد');
            })
            ->first();

        if (! $retiredStatus) {
            $this->error('Retired employment status not found in reference_data table.');

            return Command::FAILURE;
        }

        $currentYear = Carbon::now()->year;
        $currentMonth = Carbon::now()->month;

        // Get employees who should be retired this year or earlier
        // Retirement happens when: birth_date + 60 years <= current date (considering month)
        $employeesToRetire = Employee::whereNotNull('birth_date')
            ->whereDoesntHave('workDetail', function ($query) use ($retiredStatus) {
                $query->where('employment_status_id', $retiredStatus->id);
            })
            ->get()
            ->filter(function ($employee) use ($currentYear, $currentMonth) {
                if (! $employee->birth_date) {
                    return false;
                }

                $retirementDate = Carbon::parse($employee->birth_date)->addYears(60);
                $retirementYear = $retirementDate->year;
                $retirementMonth = $retirementDate->month;

                // Check if retirement date has passed (considering month)
                if ($retirementYear < $currentYear) {
                    return true;
                }

                if ($retirementYear === $currentYear && $retirementMonth <= $currentMonth) {
                    return true;
                }

                return false;
            });

        $count = 0;

        foreach ($employeesToRetire as $employee) {
            $workDetail = $employee->workDetail;

            if ($workDetail) {
                $workDetail->update([
                    'employment_status_id' => $retiredStatus->id,
                ]);
            } else {
                // Create work detail if it doesn't exist
                WorkDetail::create([
                    'employee_id' => $employee->id,
                    'employment_status_id' => $retiredStatus->id,
                ]);
            }

            $count++;
        }

        $this->info("Marked {$count} employee(s) as retired.");

        return Command::SUCCESS;
    }
}
