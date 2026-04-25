<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\ReferenceData;
use Carbon\Carbon;
use Illuminate\Contracts\View\View as ViewContract;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class EmployeeTableService
{
    private ?Collection $contractMap = null;

    public function handle(Request $request, array $context = []): array
    {
        $context = array_merge([
            'contract_values' => [],
            'exclude_contracts' => false,
            'only_permanent_contract' => false,
            'permanent_contract_id' => null,
            'actions_view' => 'employees.partials.actions',
        ], $context);

        // Check if filtering by "عقد تشغيل" employment type - if so, don't exclude contracts
        $employmentTypeFilter = $request->input('filter_employment_type');
        if (! empty($employmentTypeFilter)) {
            $contractEmploymentTypeId = ReferenceData::where('name', 'EMPLOYMENT_TYPE')
                ->where('slug', 'employment_type.contract')
                ->value('id');

            $filterIds = is_array($employmentTypeFilter)
                ? array_map('intval', array_filter($employmentTypeFilter))
                : [intval($employmentTypeFilter)];

            // If filtering by "عقد تشغيل" employment type, don't exclude contracts
            if ($contractEmploymentTypeId && in_array($contractEmploymentTypeId, $filterIds, true)) {
                $context['exclude_contracts'] = false;
            }
        }

        $baseQuery = $this->baseQuery($context);

        $totalRecords = (clone $baseQuery)->count();

        $filteredQuery = $this->applyFilters($baseQuery, $request);

        $recordsFiltered = (clone $filteredQuery)->count();

        $orderedQuery = $this->applyOrdering($filteredQuery, $request);

        $paginatedQuery = $this->applyPagination($orderedQuery, $request);

        // Get employee IDs first
        $employeeIds = $paginatedQuery->pluck('employees.id')->toArray();

        // Then load full Employee models with relationships
        $employees = Employee::whereIn('id', $employeeIds)
            ->with('user')
            ->get()
            ->keyBy('id');

        $start = (int) $request->input('start', 0);

        // Get the raw query results to access the selected columns
        $rawResults = $paginatedQuery->get();

        $data = $rawResults->map(function ($rawEmployee, $index) use ($start, $context, $employees) {
            // Get the full Employee model
            $employee = $employees->get($rawEmployee->id);

            if (! $employee) {
                // Fallback if employee not found
                $employee = Employee::with('user')->find($rawEmployee->id);
            }

            if (! $employee) {
                return null;
            }

            // Use getAttribute to get the SQL alias value, not the accessor
            $fullName = $rawEmployee->getRawOriginal('full_name') ?? $rawEmployee->full_name;

            return [
                'id' => $employee->id,
                'row_number' => $start + $index + 1,
                'full_name' => $fullName && trim($fullName) !== '' ? trim($fullName) : '-',
                'national_id' => $employee->national_id ?? '-',
                'employee_number' => $employee->employee_number ?? '-',
                'primary_phone' => $employee->primary_phone ?? '-',
                'birth_date' => $employee->birth_date
                    ? Carbon::parse($employee->birth_date)->format('Y-m-d')
                    : '-',
                'employment_type_name' => $rawEmployee->employment_type_name ?? '-',
                'department_name' => $rawEmployee->department_name ?? '-',
                'job_title_name' => $rawEmployee->job_title_name ?? '-',
//                'actions' => $this->renderActions($employee, $context['actions_view']),
            ];
        })->filter();

        return [
            'draw' => (int) $request->input('draw'),
            'recordsTotal' => $totalRecords,
            'recordsFiltered' => $recordsFiltered,
            'data' => $data,
        ];
    }

    private function baseQuery(array $context): Builder
    {
        $fullNameExpression = "TRIM(CONCAT_WS(' ', employees.first_name, employees.second_name, employees.third_name, employees.family_name))";

        $query = Employee::query()
            ->select([
                'employees.id',
                DB::raw("$fullNameExpression AS full_name"),
                'employees.national_id',
                'employees.employee_number',
                'employees.primary_phone',
                'employees.birth_date',
                'departments.value as department_name',
                'job_titles.value as job_title_name',
                'employment_status_types.value as employment_type_name',
                'employment_status_types.id as employment_type_id',
            ])
            ->leftJoin('work_details', 'work_details.employee_id', '=', 'employees.id')
            ->leftJoin('reference_data as departments', 'departments.id', '=', 'work_details.work_department_id')
            ->leftJoin('reference_data as job_titles', 'job_titles.id', '=', 'work_details.job_title_id')
            ->leftJoin('reference_data as employment_status_types', 'employment_status_types.id', '=', 'work_details.employment_type_id');

        if ($context['exclude_contracts']) {
            $contractIds = $this->getContractIds();
            if (count($contractIds) > 0) {
                $query->where(function ($builder) use ($contractIds) {
                    $builder->whereNull('employees.contract_id')
                        ->orWhereNotIn('employees.contract_id', $contractIds);
                });
            } else {
                $query->whereNull('employees.contract_id');
            }
        }

        // Only include permanent contract (عقد دائم) for "at work" filter - exclude all other contracts
        if ($context['only_permanent_contract'] && ! empty($context['permanent_contract_id'])) {
            $query->where(function ($builder) use ($context) {
                $builder->whereNull('employees.contract_id')
                    ->orWhere('employees.contract_id', $context['permanent_contract_id']);
            });
        }

        if (! empty($context['contract_values'])) {
            $contractIds = $this->getContractIds($context['contract_values']);

            if (! empty($contractIds)) {
                $query->whereIn('employees.contract_id', $contractIds);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        if (! empty($context['employee_ids'])) {
            $query->whereIn('employees.id', $context['employee_ids']);
        }else{
            if (array_key_exists('employee_ids',$context)){
                //$query->whereRaw('1 = 0');
                $query->whereIn('employees.id', $context['employee_ids']);
            }
        }

        return $query;
    }

    private function applyFilters(Builder $query, Request $request): Builder
    {
        $fullNameExpression = "TRIM(CONCAT_WS(' ', employees.first_name, employees.second_name, employees.third_name, employees.family_name))";

        if ($request->filled('filter_full_name')) {
            $like = '%'.$request->input('filter_full_name').'%';
            $query->whereRaw("$fullNameExpression LIKE ?", [$like]);
        }

        if ($request->filled('filter_national_id')) {
            $query->where('employees.national_id', 'like', '%'.$request->input('filter_national_id').'%');
        }

        if ($request->filled('filter_employee_number')) {
            $query->where('employees.employee_number', 'like', '%'.$request->input('filter_employee_number').'%');
        }

        if ($request->filled('filter_primary_phone')) {
            $query->where('employees.primary_phone', 'like', '%'.$request->input('filter_primary_phone').'%');
        }

        if ($request->filled('filter_birthdate_from')) {
            $from = Carbon::parse($request->input('filter_birthdate_from'))->startOfDay();
            $query->whereDate('employees.birth_date', '>=', $from);
        }

        if ($request->filled('filter_birthdate_to')) {
            $to = Carbon::parse($request->input('filter_birthdate_to'))->endOfDay();
            $query->whereDate('employees.birth_date', '<=', $to);
        }

        $filterableWorkDetailFields = [
            'ministry' => 'ministry_id',
            'management_department' => 'management_department_id',
            'department' => 'work_department_id',
            'section' => 'section_id',
            'division' => 'division_id',
            'unit' => 'unit_id',
            'crossing' => 'crossing_id',
            'sub_office' => 'sub_office_id',
            'job_title' => 'job_title_id',
            'employment_status' => 'employment_status_id',
            'employment_type' => 'employment_type_id',
            'program' => 'program_id',
            'classification' => 'classification_id',
            'category' => 'category_id',
            'certificate' => 'certificate_id',
            'degree' => 'degree_id',
        ];

        foreach ($filterableWorkDetailFields as $requestKey => $column) {
            $parameter = 'filter_'.$requestKey;
            $values = $request->input($parameter);
            $nullPlaceholder = '__null__';

            if (is_array($values)) {
                $values = array_filter($values, fn ($value) => $value !== null && $value !== '');
                $hasNullPlaceholder = in_array($nullPlaceholder, $values, true);
                $sanitizedValues = array_values(array_filter($values, fn ($value) => $value !== $nullPlaceholder));

                if (! empty($sanitizedValues) && $hasNullPlaceholder) {
                    $query->where(function ($subQuery) use ($column, $sanitizedValues) {
                        $subQuery->whereIn("work_details.$column", $sanitizedValues)
                            ->orWhereNull("work_details.$column");
                    });
                } elseif (! empty($sanitizedValues)) {
                    $query->whereIn("work_details.$column", $sanitizedValues);
                } elseif ($hasNullPlaceholder) {
                    $query->whereNull("work_details.$column");
                }
            } elseif ($request->filled($parameter)) {
                if ($values === $nullPlaceholder) {
                    $query->whereNull("work_details.$column");
                } else {
                    $query->where("work_details.$column", $values);
                }
            }
        }

        // Handle CONTRACT filter (stored in employees table, not work_details)
        if ($request->filled('filter_contract')) {
            $values = $request->input('filter_contract');
            $nullPlaceholder = '__null__';

            if (is_array($values)) {
                $values = array_filter($values, fn ($value) => $value !== null && $value !== '');
                $hasNullPlaceholder = in_array($nullPlaceholder, $values, true);
                $sanitizedValues = array_values(array_filter($values, fn ($value) => $value !== $nullPlaceholder));

                if (! empty($sanitizedValues) && $hasNullPlaceholder) {
                    $query->where(function ($subQuery) use ($sanitizedValues) {
                        $subQuery->whereIn('employees.contract_id', $sanitizedValues)
                            ->orWhereNull('employees.contract_id');
                    });
                } elseif (! empty($sanitizedValues)) {
                    $query->whereIn('employees.contract_id', $sanitizedValues);
                } elseif ($hasNullPlaceholder) {
                    $query->whereNull('employees.contract_id');
                }
            } elseif ($values === $nullPlaceholder) {
                $query->whereNull('employees.contract_id');
            } else {
                $query->where('employees.contract_id', $values);
            }
        }

        $searchValue = $request->input('search.value');
        if (! empty($searchValue)) {
            $like = '%'.$searchValue.'%';
            $query->where(function ($where) use ($like, $fullNameExpression) {
                $where->whereRaw("$fullNameExpression LIKE ?", [$like])
                    ->orWhere('employees.national_id', 'like', $like)
                    ->orWhere('employees.employee_number', 'like', $like)
                    ->orWhere('employees.primary_phone', 'like', $like)
                    ->orWhere('departments.value', 'like', $like)
                    ->orWhere('job_titles.value', 'like', $like)
                    ->orWhere('employment_status_types.value', 'like', $like);
            });
        }

        return $query;
    }

    private function applyOrdering(Builder $query, Request $request): Builder
    {
        $fullNameExpression = "TRIM(CONCAT_WS(' ', employees.first_name, employees.second_name, employees.third_name, employees.family_name))";

        $orderColumnIndex = $request->input('order.0.column', 0);
        $orderDirection = $request->input('order.0.dir', 'asc');

        $orderableColumns = [
            'row_number',
            'full_name',
            'employment_type_name',
            'employees.birth_date',
            'department_name',
            'job_title_name',
            'actions',
        ];

        $orderColumn = $orderableColumns[$orderColumnIndex] ?? 'employees.created_at';

        $officialTypeId = ReferenceData::where('slug', 'employment_type.official')
            ->orWhere(function ($query) {
                $query->where('name', 'EMPLOYMENT_TYPE')
                    ->where('value', 'رسمي');
            })
            ->value('id');

        if ($officialTypeId) {
            $query->orderByRaw(
                'CASE
                    WHEN work_details.employment_type_id = ? THEN 1
                    ELSE 2
                END',
                [$officialTypeId]
            );
        }

        if ($orderColumn === 'row_number' || $orderColumn === 'actions') {
            $query->orderByRaw("$fullNameExpression ASC");
        } elseif ($orderColumn === 'full_name') {
            $query->orderByRaw("$fullNameExpression $orderDirection");
        } elseif ($orderColumn === 'employment_type_name') {
            $query->orderBy('employment_status_types.value', $orderDirection);
        } elseif ($orderColumn === 'department_name') {
            $query->orderBy('departments.value', $orderDirection);
        } elseif ($orderColumn === 'job_title_name') {
            $query->orderBy('job_titles.value', $orderDirection);
        } else {
            $query->orderBy($orderColumn, $orderDirection);
        }

        return $query;
    }

    private function applyPagination(Builder $query, Request $request): Builder
    {
        $length = (int) $request->input('length', 10);

        if ($length !== -1) {
            $query->skip((int) $request->input('start', 0))->take($length);
        }

        return $query;
    }

    /**
     * @return array<int, int>
     */
    private function getContractIds(array $values = []): array
    {
        $map = $this->getContractMap();

        if (empty($values)) {
            return $map->pluck('id')->filter()->values()->all();
        }

        return collect($values)
            ->map(fn ($value) => $map->firstWhere('value', $value)['id'] ?? null)
            ->filter()
            ->values()
            ->all();
    }

    private function getContractMap(): Collection
    {
        if ($this->contractMap !== null) {
            return $this->contractMap;
        }

        $contracts = ReferenceData::where('name', 'CONTRACT')->get();

        $this->contractMap = $contracts->map(fn ($contract) => [
            'id' => $contract->id,
            'value' => $contract->value,
        ]);

        return $this->contractMap;
    }

    private function renderActions($employee, string $view): string
    {
        /** @var ViewContract $viewInstance */
        $viewInstance = view($view, ['employee' => $employee]);

        return $viewInstance->render();
    }
}
