<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Concerns\ProvidesEmployeeReferenceData;
use App\Http\Controllers\Controller;
use App\Http\Resources\RetireesResource;
use App\Models\Employee;
use App\Models\ReferenceData;
use App\Models\WorkDetail;
use App\Services\EmployeeTableService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class RetireesController extends Controller
{
    use ProvidesEmployeeReferenceData;

    public function __construct(private readonly EmployeeTableService $employeeTableService) {}

    /**
     * Display the retirees page with year filtering.
     */
    public function index(Request $request)
    {
        $filter = $request->query('filter', 'now');
        $currentYear = Carbon::now()->year;
        $currentMonth = Carbon::now()->month;

        $retiredStatus = ReferenceData::where('slug', 'employment_status.retired')
            ->orWhere(function ($query) {
                $query->where('name', 'EMPLOYMENT_STATUS')
                    ->where('value', 'متقاعد');
            })
            ->first();

        $context = [];

        if ($filter === 'now') {
            // Show currently retired employees (already marked as retired in database)
            if ($retiredStatus) {
                $retiredEmployeeIds = WorkDetail::where('employment_status_id', $retiredStatus->id)
                    ->pluck('employee_id')
                    ->toArray();

                $context['employee_ids'] = $retiredEmployeeIds;
            }
        } else {
            // Show employees who will retire in the selected year
            $retirementYear = (int) $filter;

            if ($retirementYear == $currentYear) {
                // For current year, show employees who will retire AFTER this month
                $employeesInYear = Employee::whereNotNull('birth_date')
                    ->whereDoesntHave('workDetail', function ($query) use ($retiredStatus) {
                        if ($retiredStatus) {
                            $query->where('employment_status_id', $retiredStatus->id);
                        }
                    })
                    ->get()
                    ->filter(function ($employee) use ($retirementYear, $currentMonth) {
                        $retirementDate = Carbon::parse($employee->birth_date)->addYears(60);

                        return $retirementDate->year === $retirementYear
                            && $retirementDate->month > $currentMonth;
                    })
                    ->pluck('id')
                    ->toArray();
            } else {
                // For future years, show all employees who will retire in that year
                $targetYearStart = Carbon::create($retirementYear, 1, 1)->startOfYear();
                $targetYearEnd = Carbon::create($retirementYear, 12, 31)->endOfYear();

                $birthDateStart = $targetYearStart->copy()->subYears(60)->startOfYear();
                $birthDateEnd = $targetYearEnd->copy()->subYears(60)->endOfYear();

                $employeesInYear = Employee::whereNotNull('birth_date')
                    ->whereBetween('birth_date', [$birthDateStart, $birthDateEnd])
                    ->whereDoesntHave('workDetail', function ($query) use ($retiredStatus) {
                        if ($retiredStatus) {
                            $query->where('employment_status_id', $retiredStatus->id);
                        }
                    })
                    ->get()
                    ->filter(function ($employee) use ($retirementYear) {
                        $retirementDate = Carbon::parse($employee->birth_date)->addYears(60);

                        return $retirementDate->year === $retirementYear;
                    })
                    ->pluck('id')
                    ->toArray();
            }

            $context['employee_ids'] = $employeesInYear;
        }

        $payload = $this->employeeTableService->handle($request, $context);

        return new RetireesResource($payload);
    }
}
