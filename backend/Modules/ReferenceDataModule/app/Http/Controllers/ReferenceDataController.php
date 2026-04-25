<?php

namespace Modules\ReferenceDataModule\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReferenceDataRequest;
use App\Http\Requests\UpdateReferenceDataRequest;
use App\Http\Resources\ReferenceDataResource;
use App\Models\Employee;
use App\Models\ReferenceData;
use App\Models\WorkDetail;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReferenceDataController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $type = $request->query('type');
        $employeeCounts = [];
        $nullEmployeeCount = 0;

        if ($type) {
            $referenceData = ReferenceData::query()
                ->where('name', '=', $type)
                ->orderBy('value', 'asc')
                ->get();

            // Build employee counts for this reference type
            $workDetailColumnMap = [
                'MINISTRY' => 'ministry_id',
                'MANAGEMENT_DEPARTMENT' => 'management_department_id',
                'DEPARTMENT' => 'work_department_id',
                'SECTION' => 'section_id',
                'DIVISION' => 'division_id',
                'UNIT' => 'unit_id',
                'CROSSING' => 'crossing_id',
                'SUB_OFFICE' => 'sub_office_id',
                'JOB_TITLE' => 'job_title_id',
                'EMPLOYMENT_STATUS' => 'employment_status_id',
                'EMPLOYMENT_TYPE' => 'employment_type_id',
                'PROGRAM' => 'program_id',
                'CLASSIFICATION' => 'classification_id',
                'CATEGORY' => 'category_id',
                'JOB_SCALE' => 'job_scale_id',
                'DEGREE' => 'degree_id',
                'CERTIFICATE' => 'certificate_id',
            ];

            $employeeCounts = [];
            $nullEmployeeCount = 0;

            if (isset($workDetailColumnMap[$type])) {
                $column = $workDetailColumnMap[$type];

                $employeeCounts = WorkDetail::query()
                    ->selectRaw("$column as reference_id, COUNT(*) as aggregate")
                    ->whereNotNull($column)
                    ->groupBy($column)
                    ->pluck('aggregate', 'reference_id')
                    ->toArray();

                $nullEmployeeCount = WorkDetail::query()
                    ->whereNull($column)
                    ->count();
            } elseif ($type === 'BANK') {
                $employeeCounts = Employee::query()
                    ->selectRaw('bank_id as reference_id, COUNT(*) as aggregate')
                    ->whereNotNull('bank_id')
                    ->groupBy('bank_id')
                    ->pluck('aggregate', 'reference_id')
                    ->toArray();

                $nullEmployeeCount = Employee::query()
                    ->whereNull('bank_id')
                    ->count();
            } elseif ($type === 'CONTRACT') {
                $employeeCounts = Employee::query()
                    ->selectRaw('contract_id as reference_id, COUNT(*) as aggregate')
                    ->whereNotNull('contract_id')
                    ->groupBy('contract_id')
                    ->pluck('aggregate', 'reference_id')
                    ->toArray();

                $nullEmployeeCount = Employee::query()
                    ->whereNull('contract_id')
                    ->count();
            } elseif ($type === 'EMPLOYEE_DOCUMENT') {
                $employeeCounts = \App\Models\EmployeeDocument::query()
                    ->selectRaw('document_type_id as reference_id, COUNT(DISTINCT employee_id) as aggregate')
                    ->whereNotNull('document_type_id')
                    ->groupBy('document_type_id')
                    ->pluck('aggregate', 'reference_id')
                    ->toArray();

                $nullEmployeeCount = \App\Models\EmployeeDocument::query()
                    ->whereNull('document_type_id')
                    ->count(); // This is just for completeness, might not be very useful
            } elseif ($type === 'TRAINING_TYPE') {
                $employeeCounts = \App\Models\TrainingParticipant::query()
                    ->join('training_courses', 'training_participants.training_course_id', '=', 'training_courses.id')
                    ->selectRaw('training_courses.training_type_id as reference_id, COUNT(DISTINCT training_participants.employee_id) as aggregate')
                    ->whereNotNull('training_courses.training_type_id')
                    ->groupBy('training_courses.training_type_id')
                    ->pluck('aggregate', 'reference_id')
                    ->toArray();
            } elseif ($type === 'TRAINING_CLASSIFICATION') {
                $employeeCounts = \App\Models\TrainingParticipant::query()
                    ->join('training_courses', 'training_participants.training_course_id', '=', 'training_courses.id')
                    ->selectRaw('training_courses.training_classification_id as reference_id, COUNT(DISTINCT training_participants.employee_id) as aggregate')
                    ->whereNotNull('training_courses.training_classification_id')
                    ->groupBy('training_courses.training_classification_id')
                    ->pluck('aggregate', 'reference_id')
                    ->toArray();
            }

            // Map counts to the collection
            $referenceData->each(function ($item) use ($employeeCounts) {
                $item->employee_count = $employeeCounts[$item->id] ?? 0;
            });

            return ReferenceDataResource::collection($referenceData);
        } else {
            $referenceData = ReferenceData::query()
                ->orderBy('name', 'asc')
                ->orderBy('value', 'asc')
                ->get()
                ->groupBy('name')
                ->toArray();

            // Add Cities
            $referenceData['CITY'] = \App\Models\City::query()
                ->orderBy('name', 'asc')
                ->get()
                ->map(fn($city) => ['id' => $city->id, 'value' => $city->name, 'governorate_id' => $city->governorate_id])
                ->toArray();

            // Add Governorates
            $referenceData['GOVERNORATE'] = \App\Models\Governorate::query()
                ->orderBy('name', 'asc')
                ->get()
                ->map(fn($gov) => ['id' => $gov->id, 'value' => $gov->name])
                ->toArray();
        }

        $typeLabels = $this->getTypeLabels();
        $contractValueToSlug = $this->getContractValueToSlugMapping();

        return response()->json(['data' => $referenceData]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreReferenceDataRequest $request)
    {
        $reference_data = ReferenceData::create($request->validated());

        $message = ['success' => 'تم إضافة القيمة بنجاح'];

        return response()->json(compact('reference_data', 'message'), Response::HTTP_CREATED);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateReferenceDataRequest $request, ReferenceData $referenceData): \Illuminate\Http\JsonResponse
    {
        $referenceData->update($request->validated());

        $message = ['success' => 'تم تحديث القيمة بنجاح'];

        return response()->json(compact('referenceData', 'message'), Response::HTTP_ACCEPTED);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ReferenceData $referenceData): \Illuminate\Http\JsonResponse
    {
        $type = $referenceData->name;
        ReferenceData::destroy($referenceData->getKey());

        $message = ['success' => 'تم حذف القيمة بنجاح'];

        return response()->json(compact('referenceData', 'message'), Response::HTTP_ACCEPTED);
    }

    /**
     * Get type labels mapping.
     *
     * @return array<string, string>
     */
    private function getTypeLabels(): array
    {
        return [
            'MINISTRY' => 'الوزارات',
            'EMPLOYMENT_TYPE' => 'أنواع الموظفين',
            'CLASSIFICATION' => 'تصنيفات الموظفين العامة',
            'CATEGORY' => 'الفئات',
            'JOB_SCALE' => 'السلم الوظيفي',
            'DEGREE' => 'الدرجات',
            'PROGRAM' => 'البرامج',
            'WORKPLACE' => 'أماكن العمل',
            'ADMINISTRATIVE_TITLE' => 'المسميات الادارية',
            'RETIREMENT_COMMITTEE' => 'لجان التقاعد',
            'CERTIFICATE' => 'الشهادات',
            'CONTRACT' => 'عقود التشغيل',
            'MANAGEMENT_DEPARTMENT' => 'الإدارة العامة',
            'DEPARTMENT' => 'الدائرة',
            'SECTION' => 'القسم',
            'DIVISION' => 'الشعبة',
            'UNIT' => 'الوحدة',
            'CROSSING' => 'المعبر',
            'JOB_TITLE' => 'المسمى الوظيفي',
            'EMPLOYMENT_STATUS' => 'الحالة الوظيفية',
            'BANK' => 'البنوك',
            'SUB_OFFICE' => 'المكاتب الفرعية',
            'EMPLOYEE_DOCUMENT' => 'وثائق الموظفين',
        ];
    }

    /**
     * Get contract value to slug mapping.
     *
     * @return array<string, string>
     */
    private function getContractValueToSlugMapping(): array
    {
        $mapping = ReferenceData::query()
            ->where('name', '=', 'CONTRACT')
            ->whereNotNull('slug')
            ->pluck('slug', 'value')
            ->toArray();

        if (! empty($mapping)) {
            return $mapping;
        }

        return [
            'عقد دائم' => 'permanent',
            'عقد متوقف' => 'paused',
            'عقد غير معلوم' => 'unknown',
        ];
    }
}

