<?php

namespace App\Services;

use App\Models\FamilyMember;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChildTableService
{
    public function handle(Request $request, array $context = []): array
    {
        $context = array_merge([
            'employee_id' => null,
        ], $context);

        $baseQuery = $this->baseQuery($context);

        $totalRecords = (clone $baseQuery)->count();

        $filteredQuery = $this->applyFilters($baseQuery, $request);

        $recordsFiltered = (clone $filteredQuery)->count();

        $orderedQuery = $this->applyOrdering($filteredQuery, $request);

        $paginatedQuery = $this->applyPagination($orderedQuery, $request);

        $start = (int) $request->input('start', 0);

        $results = $paginatedQuery->get();

        $data = $results->map(function ($child, $index) use ($start) {
            return [
                'id' => $child->id,
                'row_number' => $start + $index + 1,
                'full_name' => $child->full_name ?? '-',
                'national_id' => $child->national_id ?? '-',
                'gender' => $child->gender ?? '-',
                'birth_date' => $child->birth_date
                    ? Carbon::parse($child->birth_date)->format('Y-m-d')
                    : '-',
                'marital_status' => $child->marital_status ?? '-',
                'employee_name' => $child->employee_name ?? '-',
            ];
        });

        return [
            'draw' => (int) $request->input('draw'),
            'recordsTotal' => $totalRecords,
            'recordsFiltered' => $recordsFiltered,
            'data' => $data,
        ];
    }

    private function baseQuery(array $context): Builder
    {
        $employeeFullNameExpression = "TRIM(CONCAT_WS(' ', employees.first_name, employees.second_name, employees.third_name, employees.family_name))";

        $query = FamilyMember::query()
            ->select([
                'family_members.id',
                'family_members.full_name',
                'family_members.national_id',
                'family_members.birth_date',
                'family_members.gender',
                'family_members.marital_status',
                'family_members.employee_id',
                DB::raw("$employeeFullNameExpression AS employee_name"),
            ])
            ->leftJoin('employees', 'employees.id', '=', 'family_members.employee_id')
            ->where('family_members.relationship_type', 'child');

        // Filter by specific employee if provided
        if (!empty($context['employee_id'])) {
            $query->where('family_members.employee_id', $context['employee_id']);
        }

        return $query;
    }

    private function applyFilters(Builder $query, Request $request): Builder
    {
        if ($request->filled('filter_full_name')) {
            $query->where('family_members.full_name', 'like', '%' . $request->input('filter_full_name') . '%');
        }

        if ($request->filled('filter_national_id')) {
            $query->where('family_members.national_id', 'like', '%' . $request->input('filter_national_id') . '%');
        }

        if ($request->filled('filter_gender')) {
            $query->where('family_members.gender', $request->input('filter_gender'));
        }

        if ($request->filled('filter_marital_status')) {
            $query->where('family_members.marital_status', $request->input('filter_marital_status'));
        }

        if ($request->filled('filter_birthdate_from')) {
            $from = Carbon::parse($request->input('filter_birthdate_from'))->startOfDay();
            $query->whereDate('family_members.birth_date', '>=', $from);
        }

        if ($request->filled('filter_birthdate_to')) {
            $to = Carbon::parse($request->input('filter_birthdate_to'))->endOfDay();
            $query->whereDate('family_members.birth_date', '<=', $to);
        }

        // Global search
        $searchValue = $request->input('search.value');
        if (!empty($searchValue)) {
            $like = '%' . $searchValue . '%';
            $employeeFullNameExpression = "TRIM(CONCAT_WS(' ', employees.first_name, employees.second_name, employees.third_name, employees.family_name))";

            $query->where(function ($where) use ($like, $employeeFullNameExpression) {
                $where->where('family_members.full_name', 'like', $like)
                    ->orWhere('family_members.national_id', 'like', $like)
                    ->orWhere('family_members.gender', 'like', $like)
                    ->orWhere('family_members.marital_status', 'like', $like)
                    ->orWhereRaw("$employeeFullNameExpression LIKE ?", [$like]);
            });
        }

        return $query;
    }

    private function applyOrdering(Builder $query, Request $request): Builder
    {
        $orderColumnIndex = $request->input('order.0.column', 0);
        $orderDirection = $request->input('order.0.dir', 'asc');

        $orderableColumns = [
            'row_number',
            'family_members.full_name',
            'family_members.national_id',
            'family_members.gender',
            'family_members.birth_date',
            'family_members.marital_status',
            'employee_name',
        ];

        $orderColumn = $orderableColumns[$orderColumnIndex] ?? 'family_members.created_at';

        if ($orderColumn === 'row_number') {
            $query->orderBy('family_members.full_name', 'asc');
        } elseif ($orderColumn === 'employee_name') {
            $employeeFullNameExpression = "TRIM(CONCAT_WS(' ', employees.first_name, employees.second_name, employees.third_name, employees.family_name))";
            $query->orderByRaw("$employeeFullNameExpression $orderDirection");
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
}
