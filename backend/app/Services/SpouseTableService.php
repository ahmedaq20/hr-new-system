<?php

namespace App\Services;

use App\Models\EmployeeSpouse;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SpouseTableService
{
    /**
     * Handle request and return spouse data for API
     */
    public function handle(Request $request): array
    {
        $baseQuery = $this->baseQuery();

        $totalRecords = (clone $baseQuery)->count();
        $filteredQuery = $this->applyFilters($baseQuery, $request);
        $recordsFiltered = (clone $filteredQuery)->count();
        $orderedQuery = $this->applyOrdering($filteredQuery, $request);
        $paginatedQuery = $this->applyPagination($orderedQuery, $request);
        $spouses = $paginatedQuery->get();

        $start = (int) $request->input('start', 0);

        $data = $spouses->map(function ($spouse, $index) use ($start) {
            return [
                'id' => $spouse->id,
                'row_number' => $start + $index + 1,
                'employee_name' => $spouse->employee_name ?? '-',
                'employee_id' => $spouse->employee_id,
                'full_name' => $spouse->full_name ?? '-',
                'spouse_id_number' => $spouse->spouse_id_number ?? '-',
                'marriage_date' => $spouse->marriage_date ? Carbon::parse($spouse->marriage_date)->format('Y-m-d') : '-',
                'marital_status' => $spouse->marital_status ?? '-',
                'is_working' => $spouse->is_working ? 'نعم' : 'لا',
                'work_sector' => $spouse->work_sector ?? '-',
                'mobile' => $spouse->mobile ?? '-',
                'actions' => $this->renderActions($spouse),
            ];
        });

        return [
            'draw' => (int) $request->input('draw', 1),
            'recordsTotal' => $totalRecords,
            'recordsFiltered' => $recordsFiltered,
            'data' => $data,
        ];
    }

    /*** ======= دوال داخلية ======= ***/

    private function baseQuery(): Builder
    {
        $fullNameExpression = "TRIM(CONCAT_WS(' ', employees.first_name, employees.second_name, employees.third_name, employees.family_name))";

        return EmployeeSpouse::query()
            ->select([
                'employee_spouses.*',
                DB::raw("$fullNameExpression AS employee_name"),
            ])
            ->leftJoin('employees', 'employees.id', '=', 'employee_spouses.employee_id')
            ->whereNull('employee_spouses.deleted_at');
    }

    private function applyFilters(Builder $query, Request $request): Builder
    {
        if ($request->filled('search.value')) {
            $search = $request->input('search.value');
            $query->where(function ($q) use ($search) {
                $q->where('employee_spouses.full_name', 'LIKE', "%{$search}%")
                  ->orWhere('employee_spouses.spouse_id_number', 'LIKE', "%{$search}%")
                  ->orWhere('employee_spouses.mobile', 'LIKE', "%{$search}%")
                  ->orWhereRaw("CONCAT_WS(' ', employees.first_name, employees.second_name, employees.third_name, employees.family_name) LIKE ?", ["%{$search}%"]);
            });
        }

        $filters = ['employee_id','full_name','spouse_id_number','marital_status','is_working','work_sector'];
        foreach ($filters as $f) {
            if ($request->filled($f)) {
                $query->where("employee_spouses.$f", $request->input($f));
            }
        }

        if ($request->filled('marriage_date_from')) {
            $query->whereDate('employee_spouses.marriage_date', '>=', $request->input('marriage_date_from'));
        }

        if ($request->filled('marriage_date_to')) {
            $query->whereDate('employee_spouses.marriage_date', '<=', $request->input('marriage_date_to'));
        }

        return $query;
    }

    private function applyOrdering(Builder $query, Request $request): Builder
    {
        $columns = [
            0 => 'employee_spouses.id',
            1 => 'employee_name',
            2 => 'employee_spouses.full_name',
            3 => 'employee_spouses.spouse_id_number',
            4 => 'employee_spouses.marriage_date',
            5 => 'employee_spouses.marital_status',
            6 => 'employee_spouses.is_working',
            7 => 'employee_spouses.work_sector',
            8 => 'employee_spouses.mobile',
        ];

        if ($request->filled('order.0.column')) {
            $idx = (int) $request->input('order.0.column');
            $dir = $request->input('order.0.dir', 'asc');
            if (isset($columns[$idx])) {
                $query->orderBy($columns[$idx], $dir);
            }
        } else {
            $query->latest('employee_spouses.created_at');
        }

        return $query;
    }

    private function applyPagination(Builder $query, Request $request): Builder
    {
        $start = (int) $request->input('start', 0);
        $length = (int) $request->input('length', 25);

        return $query->skip($start)->take($length);
    }
private function renderActions($spouse): array
{
    return [
        'update' => route('employees.spouses.update', ['employee' => $spouse->employee_id, 'spouse' => $spouse->id]),
        'delete' => route('employees.spouses.destroy', ['employee' => $spouse->employee_id, 'spouse' => $spouse->id]),
    ];
}

}
