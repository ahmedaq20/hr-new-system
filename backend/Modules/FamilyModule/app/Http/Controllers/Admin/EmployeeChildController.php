<?php

namespace Modules\FamilyModule\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmployeeChild;
use Illuminate\Http\Request;

class EmployeeChildController extends Controller
{
    /**
     * Admin list endpoint.
     */
    public function index(Request $request)
    {
        return response()->json([
            'message' => 'Use /api/v1/children/data for listing (DataTables).',
        ]);
    }

    /**
     * DataTables JSON source.
     */
    public function data(Request $request)
    {
        $query = EmployeeChild::query()->with(['employee', 'approver']);

        $totalRecords = (clone $query)->count();

        // Search
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('employee_children.full_name', 'like', "%{$searchTerm}%")
                  ->orWhere('employee_children.id_number', 'like', "%{$searchTerm}%")
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
            $query->where('employee_children.approval_status', $targetStatus);
        } else {
            $query->where('employee_children.approval_status', 'approved');
        }

        $recordsFiltered = (clone $query)->count();

        // Ordering
        $orderColumn = (int) $request->input('order.0.column', 0);
        $orderDir = $request->input('order.0.dir', 'desc');
        $columns = ['employee_name', 'full_name', 'birth_date', 'created_at'];

        if (isset($columns[$orderColumn])) {
            if ($columns[$orderColumn] === 'employee_name') {
                $query->join('employees', 'employees.id', '=', 'employee_children.employee_id')
                    ->orderByRaw("CONCAT_WS(' ', employees.first_name, employees.second_name, employees.third_name, employees.family_name) {$orderDir}");
            } else {
                $query->orderBy('employee_children.' . $columns[$orderColumn], $orderDir);
            }
        } else {
            $query->latest('employee_children.created_at');
        }

        $query->select('employee_children.*');

        // Pagination
        $start = (int) $request->input('start', 0);
        $length = (int) $request->input('length', 10);
        $data = $query->skip($start)->take($length)->get();

        $formattedData = $data->map(function ($child, $index) use ($start) {
            return [
                'id' => $child->id,
                'row_number' => $start + $index + 1,
                'employee_name' => $child->employee?->full_name ?? '-',
                'national_id' => $child->employee?->national_id ?? '-',
                'employee_id' => $child->employee_id,
                'full_name' => $child->full_name ?? '-',
                'gender' => $child->gender ?? '-',
                'id_number' => $child->id_number ?? '-',
                'birth_date' => $child->birth_date?->format('Y-m-d') ?? '-',
                'mother_full_name' => $child->mother_full_name ?? '-',
                'mother_id_number' => $child->mother_id_number ?? '-',
                'marital_status' => $child->marital_status ?? '-',
                'is_working' => $child->is_working ? 'نعم' : 'لا',
                'is_university_student' => $child->is_university_student ? 'نعم' : 'لا',
                'notes' => $child->notes ?? '-',
                'id_card_image' => $child->id_card_image ? asset('storage/' . $child->id_card_image) : null,
                'birth_certificate_image' => $child->birth_certificate_image ? asset('storage/' . $child->birth_certificate_image) : null,
                'university_certificate_image' => $child->university_certificate_image ? asset('storage/' . $child->university_certificate_image) : null,
                'approval_status' => $child->approval_status === 'approved' ? 'accepted' : 
                                     ($child->approval_status === 'rejected' ? 'refused' : 'pending'),
                'approved_by_name' => $child->approver?->name,
                'approved_at' => $child->approved_at,
                'rejection_reason' => $child->rejection_reason,
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
     * Approve a child record.
     */
    public function approve(Request $request, $id)
    {
        $child = EmployeeChild::findOrFail($id);

        if ($child->approval_status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'الطلب غير متاح للمعالجة'], 422);
        }

        $child->update([
            'approval_status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تمت الموافقة على طلب إضافة/تعديل الابن/الابنة بنجاح.'
        ]);
    }

    /**
     * Reject a child record.
     */
    public function reject(Request $request, $id)
    {
        $child = EmployeeChild::findOrFail($id);

        if ($child->approval_status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'الطلب غير متاح للمعالجة'], 422);
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $child->update([
            'approval_status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم رفض طلب إضافة/تعديل الابن/الابنة.'
        ]);
    }
}
