<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Concerns\ProvidesEmployeeReferenceData;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeCreateResource;
use App\Http\Resources\EmployeeIndexResource;
use App\Http\Resources\EmployeesResource;
use App\Models\City;
use App\Models\Employee;
use App\Models\Governorate;
use App\Models\ReferenceData;
use App\Models\WorkDetail;
use App\Services\EmployeeTableService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EmployeeController extends Controller
{
    use ProvidesEmployeeReferenceData;

    private const GENDER_LABELS = [
        'male' => 'ذكر',
        'female' => 'أنثى',
    ];

    private const MARITAL_STATUS_LABELS = [
        'single' => 'أعزب/عزباء',
        'married' => 'متزوج/متزوجة',
        'divorced' => 'مطلق/مطلقة',
        'widowed' => 'أرمل/أرملة',
    ];

    public function __construct(private readonly EmployeeTableService $employeeTableService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $payload = $this->employeeTableService->handle($request, [
            'exclude_contracts' => true,
        ]);

        return new EmployeesResource($payload);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEmployeeRequest $request)
    {
        $city = $request->city_id ? $this->find_city($request) : null;

        $employee = Employee::create([
            'first_name'        => $request->first_name,
            'second_name'       => $request->second_name,
            'third_name'        => $request->third_name,
            'family_name'       => $request->family_name,
            'birth_date'        => $request->birth_date,
            'gender'            => $request->gender,
            'marital_status'    => $request->marital_status,
            'primary_phone'     => $request->primary_phone,
            'secondary_phone'   => $request->secondary_phone,
            'email'             => $request->email,

            'national_id'       => $request->national_id,
            'employee_number'   => $request->employee_number,
            'date_of_appointment' => $request->date_of_appointment,

            'governorate_id'      => $city ? $city->governorate_id : null,
            'city_id'             => $city ? $city->id : null,
            'address'             => $request->address,

            'is_alive'              => 1,
        ]);

        // Create user for the employee
        $user = \App\Models\User::create([
            'name' => $employee->full_name,
            'national_id' => $employee->national_id,
            'email' => $employee->email ?? ($employee->national_id . '@moe.gov.ps'),
            'password' => bcrypt($employee->employee_number ?? ($employee->birth_date ? $employee->birth_date->format('Ymd') : '12345678')),
        ]);

        $user->assignRole('employee');

        $employee->update(['user_id' => $user->id]);

        return (new EmployeesResource($employee))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Employee $employee): JsonResponse
    {
        $employee->load([
            'governorate',
            'city',
            'bank',
            'contract',
            'workDetail' => function ($query) {
                $query->with([
                    'ministry',
                    'managementDepartment',
                    'workDepartment',
                    'section',
                    'division',
                    'unit',
                    'subOffice',
                    'crossing',
                    'jobTitle',
                    'employmentStatus',
                    'employmentType',
                    'program',
                    'classification',
                    'category',
                    'jobScale',
                    'degree',
                    'certificate',
                ]);
            },
        ]);

        return (new EmployeesResource($employee))
            ->response()
            ->setStatusCode(Response::HTTP_ACCEPTED);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEmployeeRequest $request, Employee $employee)
    {
        $city = $request->city_id ? $this->find_city($request) : null;

        // Update employee with validated data
        $employeeData = $request->only([
            'first_name', 'second_name', 'third_name', 'family_name',
            'birth_date', 'gender', 'marital_status',
            'primary_phone', 'secondary_phone', 'email',
            'national_id', 'employee_number', 'date_of_appointment',
            'contract_id', 'address', 'bank_id', 'bank_account_number', 'bank_iban'
        ]);

        if ($city) {
            $employeeData['governorate_id'] = $city->governorate_id;
            $employeeData['city_id'] = $city->id;
        }

        $employee->update($employeeData);

        // Update or create work details
        $workDetailData = [
            'ministry_id' => $request->ministry_id,
            'management_department_id' => $request->management_department_id,
            'work_department_id' => $request->work_department_id,
            'section_id' => $request->section_id,
            'division_id' => $request->division_id,
            'unit_id' => $request->unit_id,
            'crossing_id' => $request->crossing_id,
            'sub_office_id' => $request->sub_office_id,
            'job_title_id' => $request->job_title_id,
            'employment_status_id' => $request->employment_status_id,
            'employment_type_id' => $request->employment_type_id,
            'program_id' => $request->program_id,
            'classification_id' => $request->classification_id,
            'category_id' => $request->category_id,
            'job_scale_id' => $request->job_scale_id,
            'degree_id' => $request->degree_id,
            'seniority' => $request->seniority,
            'certificate_id' => $request->certificate_id,
            'actual_service' => $request->actual_service,
            'promotion' => $request->promotion,
            'salary_purposes' => $request->salary_purposes,
            'fragmentation' => $request->fragmentation,
            'notes' => $request->notes,
        ];

        if ($request->has('is_supervisory')) {
            $value = $request->is_supervisory;
            $workDetailData['is_supervisory'] = ($value === 'نعم' || $value === 1 || $value === true || $value === '1');
        }

        $work_detail = WorkDetail::updateOrCreate(
            ['employee_id' => $employee->id],
            $workDetailData
        );

        // Sync with User model if exists
        if ($employee->user) {
            $employee->user->update([
                'name' => $employee->full_name,
                'email' => $employee->email ?? $employee->user->email,
                'national_id' => $employee->national_id,
            ]);
        }

        // Load relations for the resource
        $employee->load('workDetail');

        return (new EmployeesResource($employee))
            ->response()
            ->setStatusCode(Response::HTTP_ACCEPTED);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        $employee->workDetail()->delete();
        $employee->delete();

        $message = 'تم الحذف بنجاح';
        return response()->json(compact('message'))->setStatusCode(Response::HTTP_ACCEPTED);
    }

    public function find_governorate(Request $request)
    {
        $governorate = Governorate::findOrFail($request->governorate_id);

        $governorate->load('cities');

        return response()->json(compact('governorate'), 200);
    }

    protected function find_city(Request $request)
    {
        $city = City::/* with('governorate')-> */ find($request->city_id);

        return $city;
    }

    private function detailItem(string $label, mixed $value): array
    {
        return [
            'label' => $label,
            'value' => $this->formatValue($value),
        ];
    }

    private function formatValue(mixed $value, string $fallback = '-'): string
    {
        if ($value instanceof Carbon) {
            return $value->format('Y-m-d');
        }

        if (is_bool($value)) {
            return $value ? 'نعم' : 'لا';
        }

        if ($value === null) {
            return $fallback;
        }

        $stringValue = trim((string) $value);

        return $stringValue === '' ? $fallback : $stringValue;
    }

    private function translateGender(?string $gender): ?string
    {
        return self::GENDER_LABELS[$gender] ?? null;
    }

    private function translateMaritalStatus(?string $status): ?string
    {
        return self::MARITAL_STATUS_LABELS[$status] ?? null;
    }

    private function badgeItem(string $label, ?string $value): ?array
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        return [
            'label' => $label,
            'value' => $value,
        ];
    }
}
