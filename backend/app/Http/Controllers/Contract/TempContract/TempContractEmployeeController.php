<?php

namespace App\Http\Controllers\Contract\TempContract;

use App\Http\Controllers\Concerns\ProvidesEmployeeReferenceData;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTempContractEmployeeRequest;
use App\Http\Requests\UpdateTempContractEmployeeRequest;
use App\Http\Resources\TempContractEmployeeResource;
use App\Http\Resources\TempContractEmployeesResource;
use App\Models\City;
use App\Models\Governorate;
use App\Models\TempContractEmployee;
use App\Models\TempContractProject;
use App\Services\TempContractEmployeeTableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

class TempContractEmployeeController extends Controller
{
    use ProvidesEmployeeReferenceData;

    public function __construct(private readonly TempContractEmployeeTableService $tempcontractemployeeTableService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $payload = $this->tempcontractemployeeTableService->handle($request, [
            //                'exclude_contracts' => true,
        ]);

        return new TempContractEmployeesResource($payload);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTempContractEmployeeRequest $request)
    {
        $city = $request->has('city_id') ? $this->find_city($request) : null;

        $temp_employee = TempContractEmployee::create([

            'first_name' => $request->first_name,
            'second_name' => $request->second_name,
            'third_name' => $request->third_name,
            'family_name' => $request->family_name,
            'national_id' => $request->national_id,
            'primary_phone' => $request->primary_phone,
            'secondary_phone' => $request->secondary_phone,
            'gender' => $request->gender,
            'marital_status' => $request->marital_status,
            'birth_date' => $request->birth_date,
            'position_type' => $request->position_type,
            'start_contract_date' => $request->start_contract_date,
            'end_contract_date' => $request->end_contract_date,
            'temp_contract_project_id' => $request->temp_contract_project_id,
            'governorate_id' => $city ? $city->governorate_id : null, // $request->governorate_id,
            'city_id' => $city ? $city->id : null,
            'address' => $request->address,
            'certificate_id' => $request->certificate_id,
            'university_name' => $request->university_name,
            'major_name' => $request->major_name,
            'graduation_date' => $request->graduation_date,

            //            'is_active'                 => $request->is_active,
            //            'data_entry_status'         => $request->data_entry_status,
            //            'notes'                     => $request->notes,
        ]);

        return (new TempContractEmployeeResource($temp_employee))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(TempContractEmployee $tempContractEmployee)
    {
        $tempContractEmployee->load(['governorate', 'city', 'certificate', 'project']);

        return (new TempContractEmployeeResource($tempContractEmployee))
            ->response()
            ->setStatusCode(Response::HTTP_ACCEPTED);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTempContractEmployeeRequest $request, TempContractEmployee $tempContractEmployee)
    {
        $city = $request->has('city_id') ? $this->find_city($request) : null;

        $tempContractEmployeeUpdated = $tempContractEmployee->update([

            'first_name' => $request->first_name,
            'second_name' => $request->second_name,
            'third_name' => $request->third_name,
            'family_name' => $request->family_name,
            'national_id' => $request->national_id,
            'primary_phone' => $request->primary_phone,
            'secondary_phone' => $request->secondary_phone,
            'gender' => $request->gender,
            'marital_status' => $request->marital_status,
            'birth_date' => $request->birth_date,
            'position_type' => $request->position_type,
            'start_contract_date' => $request->start_contract_date,
            'end_contract_date' => $request->end_contract_date,
            'temp_contract_project_id' => $request->temp_contract_project_id,
            'governorate_id' => $city ? $city->governorate_id : null, // $request->governorate_id,
            'city_id' => $city ? $city->id : null,
            'address' => $request->address,
            'certificate_id' => $request->certificate_id,
            'university_name' => $request->university_name,
            'major_name' => $request->major_name,
            'graduation_date' => $request->graduation_date,

            //            'is_active'                 => $request->is_active,
            //            'data_entry_status'         => $request->data_entry_status,
            //            'notes'                     => $request->notes,
        ]);

        $tempContractEmployee = TempContractEmployee::find($tempContractEmployee->id);

        return (new TempContractEmployeeResource($tempContractEmployee))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TempContractEmployee $tempContractEmployee)
    {
        $tempContractEmployee->delete();

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

    private function buildFullName(TempContractEmployee $employee): string
    {
        return trim(collect([
            $employee->first_name,
            $employee->second_name,
            $employee->third_name,
            $employee->family_name,
        ])->filter()->implode(' '));
    }

    private function detailItem(string $label, ?string $value): array
    {
        return [
            'label' => $label,
            'value' => $value ?: '-',
        ];
    }

    private function badgeItem(string $label, ?string $value): ?array
    {
        if (empty($value)) {
            return null;
        }

        return [
            'label' => $label,
            'value' => $value,
        ];
    }

    private function translateGender(?string $gender): ?string
    {
        return match ($gender) {
            'male' => 'ذكر',
            'female' => 'أنثى',
            default => null,
        };
    }

    private function translateMaritalStatus(?string $status): ?string
    {
        return match ($status) {
            'single' => 'أعزب/عزباء',
            'married' => 'متزوج/متزوجة',
            'divorced' => 'مطلق/مطلقة',
            'widowed' => 'أرمل/أرملة',
            default => null,
        };
    }

    private function formatDate($value): ?string
    {
        if (empty($value)) {
            return null;
        }

        $date = $value instanceof Carbon ? $value : Carbon::parse($value);

        return $date->format('Y-m-d');
    }
}
