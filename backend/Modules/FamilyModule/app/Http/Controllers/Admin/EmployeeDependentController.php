<?php

namespace Modules\FamilyModule\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmployeeDependent;
use Illuminate\Http\Request;

class EmployeeDependentController extends Controller
{
    /**
     * Admin list endpoint.
     */
    public function index(Request $request)
    {
        return response()->json([
            'message' => 'Use /api/v1/dependents/data for listing (DataTables).',
        ]);
    }

    /**
     * DataTables JSON source.
     */
    public function data(Request $request)
    {
        $query = EmployeeDependent::query()->with(['employee', 'approver']);

        $totalRecords = (clone $query)->count();

        // Search
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('employee_dependents.full_name', 'like', "%{$searchTerm}%")
                  ->orWhere('employee_dependents.dependent_id_number', 'like', "%{$searchTerm}%")
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
            $query->where('employee_dependents.approval_status', $targetStatus);
        } else {
            $query->where('employee_dependents.approval_status', 'approved');
        }

        $recordsFiltered = (clone $query)->count();

        // Ordering
        $orderColumn = (int) $request->input('order.0.column', 0);
        $orderDir = $request->input('order.0.dir', 'desc');
        $columns = ['employee_name', 'full_name', 'relationship', 'created_at'];

        if (isset($columns[$orderColumn])) {
            if ($columns[$orderColumn] === 'employee_name') {
                $query->join('employees', 'employees.id', '=', 'employee_dependents.employee_id')
                    ->orderByRaw("CONCAT_WS(' ', employees.first_name, employees.second_name, employees.third_name, employees.family_name) {$orderDir}");
            } else {
                $query->orderBy('employee_dependents.' . $columns[$orderColumn], $orderDir);
            }
        } else {
            $query->latest('employee_dependents.created_at');
        }

        $query->select('employee_dependents.*');

        // Pagination
        $start = (int) $request->input('start', 0);
        $length = (int) $request->input('length', 10);
        $data = $query->skip($start)->take($length)->get();

        $formattedData = $data->map(function ($dependent, $index) use ($start) {
            return [
                'id' => $dependent->id,
                'row_number' => $start + $index + 1,
                'employee_name' => $dependent->employee?->full_name ?? '-',
                'national_id' => $dependent->employee?->national_id ?? '-',
                'employee_id' => $dependent->employee_id,
                'full_name' => $dependent->full_name ?? '-',
                'relationship' => $dependent->relationship ?? '-',
                'dependent_id_number' => $dependent->dependent_id_number ?? '-',
                'birth_date' => $dependent->birth_date?->format('Y-m-d') ?? '-',
                'mobile' => $dependent->mobile ?? '-',
                'gender' => $dependent->gender ?? '-',
                'address' => $dependent->address ?? '-',
                'notes' => $dependent->notes ?? '-',
                'dependency_proof_path' => $dependent->dependency_proof_path ? asset('storage/' . $dependent->dependency_proof_path) : null,
                'approval_status' => $dependent->approval_status === 'approved' ? 'accepted' : 
                                     ($dependent->approval_status === 'rejected' ? 'refused' : 'pending'),
                'approved_by_name' => $dependent->approver?->name,
                'approved_at' => $dependent->approved_at,
                'rejection_reason' => $dependent->rejection_reason,
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
     * Approve a dependent record.
     */
    public function approve(Request $request, $id)
    {
        $dependent = EmployeeDependent::findOrFail($id);

        if ($dependent->approval_status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'الطلب غير متاح للمعالجة'], 422);
        }

        $dependent->update([
            'approval_status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تمت الموافقة على طلب إضافة/تعديل المعيل بنجاح.'
        ]);
    }

    /**
     * Reject a dependent record.
     */
    public function reject(Request $request, $id)
    {
        $dependent = EmployeeDependent::findOrFail($id);

        if ($dependent->approval_status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'الطلب غير متاح للمعالجة'], 422);
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $dependent->update([
            'approval_status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم رفض طلب إضافة/تعديل المعيل.'
        ]);
    }
}