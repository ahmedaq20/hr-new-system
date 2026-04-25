<?php

namespace Modules\FamilyModule\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmployeeSpouse;
use Illuminate\Http\Request;

class EmployeeSpouseController extends Controller
{
    /**
     * Admin list endpoint.
     */
    public function index(Request $request)
    {
        return response()->json([
            'message' => 'Use /api/v1/spouses/data for listing (DataTables).',
        ]);
    }

    /**
     * DataTables JSON source.
     */
    public function data(Request $request)
    {
        $query = EmployeeSpouse::query()->with(['employee', 'approver']);

        $totalRecords = (clone $query)->count();

        // Search
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('employee_spouses.full_name', 'like', "%{$searchTerm}%")
                  ->orWhere('employee_spouses.spouse_id_number', 'like', "%{$searchTerm}%")
                  ->orWhereHas('employee', function ($eq) use ($searchTerm) {
                      $eq->whereRaw("CONCAT_WS(' ', first_name, second_name, third_name, family_name) LIKE ?", ["%{$searchTerm}%"])
                         ->orWhere('national_id', 'like', "%{$searchTerm}%")
                         ->orWhere('employee_number', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Filter by Approval Status (Default to approved if none provided)
        $statusFilter = $request->input('status') ?: $request->input('approval_status');
        if ($statusFilter) {
            $map = ['accepted' => 'approved', 'refused' => 'rejected', 'pending' => 'pending'];
            $targetStatus = $map[$statusFilter] ?? $statusFilter;
            $query->where('employee_spouses.approval_status', $targetStatus);
        } else {
            $query->where('employee_spouses.approval_status', 'approved');
        }

        $recordsFiltered = (clone $query)->count();

        // Ordering
        $orderColumn = (int) $request->input('order.0.column', 0);
        $orderDir = $request->input('order.0.dir', 'desc');
        $columns = ['employee_name', 'full_name', 'marriage_date', 'created_at'];

        if (isset($columns[$orderColumn])) {
            if ($columns[$orderColumn] === 'employee_name') {
                $query->join('employees', 'employees.id', '=', 'employee_spouses.employee_id')
                    ->orderByRaw("CONCAT_WS(' ', employees.first_name, employees.second_name, employees.third_name, employees.family_name) {$orderDir}");
            } else {
                $query->orderBy('employee_spouses.' . $columns[$orderColumn], $orderDir);
            }
        } else {
            $query->latest('employee_spouses.created_at');
        }

        $query->select('employee_spouses.*');

        // Pagination
        $start = (int) $request->input('start', 0);
        $length = (int) $request->input('length', 10);
        $data = $query->skip($start)->take($length)->get();

        $formattedData = $data->map(function ($spouse, $index) use ($start) {
            return [
                'id' => $spouse->id,
                'row_number' => $start + $index + 1,
                'employee_name' => $spouse->employee?->full_name ?? '-',
                'national_id' => $spouse->employee?->national_id ?? '-',
                'employee_id' => $spouse->employee_id,
                'full_name' => $spouse->full_name ?? '-',
                'spouse_id_number' => $spouse->spouse_id_number ?? '-',
                'birth_date' => $spouse->birth_date?->format('Y-m-d') ?? '-',
                'marriage_date' => $spouse->marriage_date?->format('Y-m-d') ?? '-',
                'mobile' => $spouse->mobile ?? '-',
                'marital_status' => $spouse->marital_status ?? '-',
                'is_working' => $spouse->is_working ? 'نعم' : 'لا',
                'marriage_contract_path' => $spouse->marriage_contract_path ? asset('storage/' . $spouse->marriage_contract_path) : null,
                'approval_status' => $spouse->approval_status === 'approved' ? 'accepted' : 
                                     ($spouse->approval_status === 'rejected' ? 'refused' : 'pending'),
                'approved_by_name' => $spouse->approver?->name,
                'approved_at' => $spouse->approved_at,
                'rejection_reason' => $spouse->rejection_reason,
            ];
        });

        return response()->json([
            'draw' => (int) $request->input('draw'),
            'recordsTotal' => $totalRecords,
            'recordsFiltered' => $recordsFiltered,
            'data' => $formattedData,
        ]);
    }

    /**
     * Approve a spouse record.
     */
    public function approve(Request $request, $id)
    {
        $spouse = EmployeeSpouse::findOrFail($id);

        if ($spouse->approval_status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'الطلب غير متاح للمعالجة'], 422);
        }

        $spouse->update([
            'approval_status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تمت الموافقة على طلب إضافة/تعديل الزوجة بنجاح.'
        ]);
    }

    /**
     * Reject a spouse record.
     */
    public function reject(Request $request, $id)
    {
        $spouse = EmployeeSpouse::findOrFail($id);

        if ($spouse->approval_status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'الطلب غير متاح للمعالجة'], 422);
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $spouse->update([
            'approval_status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم رفض طلب إضافة/تعديل الزوجة.'
        ]);
    }
}
