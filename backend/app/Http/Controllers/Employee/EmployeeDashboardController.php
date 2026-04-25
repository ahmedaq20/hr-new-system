<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Payslip;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EmployeeDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'message' => 'Employee not found'
            ], 404);
        }


        $employee->load([
            'spouses',
            'children',
            'dependents',
            'employeeDegrees' => function ($query) {
                $query->orderByDesc('graduation_year');
            },
            'workDetail' => function ($query) {
                $query->with([
                    'workDepartment',
                    'section',
                    'jobTitle',
                    'employmentStatus',
                ]);
            },
        ]);
        $workDetail = $employee->workDetail;


        $latestPayslip = Payslip::where('employee_id', $employee->id)
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->first();

        return response()->json([

            'employment_status_card' => [
                'status' => $workDetail?->employmentStatus?->value,
            ],

            'employee_info_card' => [
                'full_name' => $user->name,
                'employee_number' => $employee->employee_number,
                'national_id' => $employee->national_id,
                'job_title' => $workDetail?->jobTitle?->value,
                'department' => $workDetail?->workDepartment?->value,
                'section' => $workDetail?->section?->value,
            ],




            'spouses_card' => $employee->spouses
                ->take(2)
                ->map(function ($spouse) {
                    return [
                        'full_name' => $spouse->full_name,
                        'id_number' => $spouse->spouse_id_number ?? '-',
                        'marital_status' => $spouse->marital_status ?? '-',
                    ];
                }),


            'children_card' => $employee->children
                ->take(2)
                ->map(function ($child) {
                    return [
                        'full_name' => $child->full_name,
                        'age' => $child->birth_date
                            ? Carbon::parse($child->birth_date)->age
                            : null,
                        'status' => $child->is_university_student
                            ? 'طالب'
                            : ($child->is_working ? 'يعمل' : 'غير محدد'),
                    ];
                }),


            'dependents_card' => $employee->dependents->map(function ($dependent) {
                return [
                    'full_name' => $dependent->full_name,
                    'relationship' => $dependent->relationship,
                ];
            }),




            $latestDegrees = $employee->employeeDegrees
            ->take(2)
            ->map(function ($degree) {
                return [
                    'qualification_name' => $degree->qualification?->value ?? '-',
                    'university_name' => $degree->university_name ?? '-',
                    'graduation_year' => $degree->graduation_date ? $degree->graduation_date->format('Y') : '-',
        ];
    }),
        ]);
    }
}
