<?php

namespace App\Services;

use App\Models\TempContractEmployee;
use Carbon\Carbon;
use Illuminate\Contracts\View\View as ViewContract;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TempContractEmployeeTableService
{
    public function handle(Request $request, array $context = []): array
    {
        $context = array_merge([
            'actions_view' => 'tempContractsEmployees.partials.actions',
        ], $context);

        $baseQuery = $this->baseQuery();
        $totalRecords = (clone $baseQuery)->count();

        $filteredQuery = $this->applyFilters($baseQuery, $request);
        $recordsFiltered = (clone $filteredQuery)->count();

        $orderedQuery = $this->applyOrdering($filteredQuery, $request);
        $paginatedQuery = $this->applyPagination($orderedQuery, $request);

        $employees = $paginatedQuery->get();
        $start = (int) $request->input('start', 0);

        $data = $employees->map(function ($employee, $index) use ($start) {
            return [
                'id' => $employee->id,
                'row_number' => $start + $index + 1,
                'full_name' => $employee->full_name ?? '-',
                'national_id' => $employee->national_id ?? '-',
                'primary_phone' => $employee->primary_phone ?? '-',
                'birth_date' => $this->formatDate($employee->birth_date),
                'position_type' => $employee->position_type ?? '-',
                'start_contract_date' => $this->formatDate($employee->start_contract_date),
                'project_name' => $employee->project_name ?? '-',
            ];
        });

        return [
            'draw' => (int) $request->input('draw'),
            'recordsTotal' => $totalRecords,
            'recordsFiltered' => $recordsFiltered,
            'data' => $data,
        ];
    }

    private function formatDate($value): string
    {
        if (empty($value)) {
            return '-';
        }

        try {
            $date = $value instanceof Carbon ? $value : Carbon::parse($value);
            return $date->format('Y-m-d');
        } catch (\Exception $e) {
            return '-';
        }
    }

    private function baseQuery(): Builder
    {
        $fullNameExpression = "TRIM(CONCAT_WS(' ', temp_contract_employees.first_name, temp_contract_employees.second_name, temp_contract_employees.third_name, temp_contract_employees.family_name))";

        return TempContractEmployee::query()
            ->leftJoin('temp_contract_projects', 'temp_contract_employees.temp_contract_project_id', '=', 'temp_contract_projects.id')
            ->select([
                'temp_contract_employees.id',
                DB::raw("$fullNameExpression AS full_name"),
                'temp_contract_employees.national_id',
                'temp_contract_employees.primary_phone',
                'temp_contract_employees.birth_date',
                'temp_contract_employees.position_type',
                'temp_contract_employees.start_contract_date',
                'temp_contract_projects.name as project_name',
            ]);
    }

    private function applyFilters(Builder $query, Request $request): Builder
    {
        $fullNameExpression = "TRIM(CONCAT_WS(' ', temp_contract_employees.first_name, temp_contract_employees.second_name, temp_contract_employees.third_name, temp_contract_employees.family_name))";

        if ($request->filled('filter_full_name')) {
            $query->whereRaw("$fullNameExpression LIKE ?", ['%'.$request->input('filter_full_name').'%']);
        }

        if ($request->filled('filter_national_id')) {
            $query->where('temp_contract_employees.national_id', 'like', '%'.$request->input('filter_national_id').'%');
        }

        if ($request->filled('filter_primary_phone')) {
            $query->where('temp_contract_employees.primary_phone', 'like', '%'.$request->input('filter_primary_phone').'%');
        }

        if ($request->filled('filter_position_type')) {
            $query->where('temp_contract_employees.position_type', 'like', '%'.$request->input('filter_position_type').'%');
        }

        if ($request->filled('filter_birthdate_from')) {
            $query->whereDate('temp_contract_employees.birth_date', '>=', Carbon::parse($request->input('filter_birthdate_from'))->startOfDay());
        }

        if ($request->filled('filter_birthdate_to')) {
            $query->whereDate('temp_contract_employees.birth_date', '<=', Carbon::parse($request->input('filter_birthdate_to'))->endOfDay());
        }

        if ($request->filled('filter_start_contract_from')) {
            $query->whereDate('temp_contract_employees.start_contract_date', '>=', Carbon::parse($request->input('filter_start_contract_from'))->startOfDay());
        }

        if ($request->filled('filter_start_contract_to')) {
            $query->whereDate('temp_contract_employees.start_contract_date', '<=', Carbon::parse($request->input('filter_start_contract_to'))->endOfDay());
        }

        if ($request->filled('filter_certificate')) {
            $values = array_filter((array) $request->input('filter_certificate'));
            if (! empty($values)) {
                $query->whereIn('temp_contract_employees.certificate_id', $values);
            }
        }

        $searchValue = $request->input('search.value');
        if (! empty($searchValue)) {
            $like = '%'.$searchValue.'%';
            $query->where(function ($where) use ($like, $fullNameExpression) {
                $where->whereRaw("$fullNameExpression LIKE ?", [$like])
                    ->orWhere('temp_contract_employees.national_id', 'like', $like)
                    ->orWhere('temp_contract_employees.primary_phone', 'like', $like)
                    ->orWhere('temp_contract_employees.position_type', 'like', $like);
            });
        }

        return $query;
    }

    private function applyOrdering(Builder $query, Request $request): Builder
    {
        $fullNameExpression = "TRIM(CONCAT_WS(' ', temp_contract_employees.first_name, temp_contract_employees.second_name, temp_contract_employees.third_name, temp_contract_employees.family_name))";

        $orderColumnIndex = $request->input('order.0.column', 0);
        $orderDirection = $request->input('order.0.dir', 'asc');

        $orderableColumns = [
            'row_number',
            'full_name',
            'temp_contract_employees.national_id',
            'temp_contract_employees.primary_phone',
            'temp_contract_employees.birth_date',
            'temp_contract_employees.position_type',
            'temp_contract_employees.start_contract_date',
            'temp_contract_projects.name',
            'actions',
        ];

        $orderColumn = $orderableColumns[$orderColumnIndex] ?? 'temp_contract_employees.created_at';

        if ($orderColumn === 'row_number' || $orderColumn === 'actions') {
            $query->orderByRaw("$fullNameExpression ASC");
        } elseif ($orderColumn === 'full_name') {
            $query->orderByRaw("$fullNameExpression $orderDirection");
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

    private function renderActions($employee, string $view): string
    {
        /** @var ViewContract $viewInstance */
        $viewInstance = view($view, ['employee' => $employee]);

        return $viewInstance->render();
    }
}
