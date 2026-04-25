<?php

namespace Modules\CoreModule\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmployeeDashboardResource;
use App\Models\Payslip;
use Illuminate\Http\Request;
use Dedoc\Scramble\Attributes\Group;

#[Group('Employee')]
class DashboardController extends Controller
{
    /**
     * Display the employee dashboard.
     * @param Request $request
     * @return EmployeeDashboardResource|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (! $employee) {
            return response()->json([
                'message' => 'Employee not found',
            ], 404);
        }

        // Load all required relationships
        $employee->load([
            'spouses',
            'children',
            'dependents',
            'governorate',
            'city',
            'degrees.qualification',
            'trainingParticipants.trainingCourse',
            'workDetail' => function ($query) {
                $query->with([
                    'workDepartment',
                    'section',
                    'jobTitle',
                    'employmentStatus',
                ]);
            },
        ]);

        // Get latest payslip and attach it to employee.
        // Eager-load parent so extractNetSalary can read from the master PDF when
        // the individual file is FPDI-generated (Smalot returns empty text from it).
        $latestPayslip = Payslip::where('employee_id', $employee->id)
            ->with('parent')
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->first();

        $employee->setRelation('latestPayslip', $latestPayslip);

        return new EmployeeDashboardResource($employee);
    }
}
