<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmployeeChild;
use App\Models\EmployeeSpouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class FamilyApprovalController extends Controller
{
    /**
     * Display pending, accepted, and refused spouses and children.
     */
    public function index(): View
    {
        return view('admin.family-approval.index');
    }

    /**
     * Get spouse full data for modal.
     */
    public function getSpouseData(EmployeeSpouse $spouse): JsonResponse
    {
        $spouse->load(['employee', 'submitter', 'approver']);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $spouse->id,
                'employee_name' => $spouse->employee?->full_name ?? 'غير محدد',
                'employee_number' => $spouse->employee?->employee_number ?? 'غير محدد',
                'full_name' => $spouse->full_name,
                'spouse_id_number' => $spouse->spouse_id_number ?? 'غير محدد',
                'marriage_date' => $spouse->marriage_date ? $spouse->marriage_date->format('Y-m-d') : null,
                'marital_status' => $spouse->marital_status ?? 'غير محدد',
                'is_working' => $spouse->is_working ? 'نعم' : 'لا',
                'work_sector' => $spouse->work_sector ?? 'غير محدد',
                'private_company_name' => $spouse->private_company_name ?? 'غير محدد',
                'international_organization_name' => $spouse->international_organization_name ?? 'غير محدد',
                'mobile' => $spouse->mobile ?? 'غير محدد',
                'marriage_contract_path' => $spouse->marriage_contract_path,
                'approval_status' => $spouse->approval_status,
                'submitted_by' => $spouse->submitter?->name ?? 'غير محدد',
                'submitted_at' => $spouse->created_at?->format('Y-m-d H:i'),
                'approved_by' => $spouse->approver?->name ?? 'غير محدد',
                'approved_at' => $spouse->approved_at?->format('Y-m-d H:i'),
                'rejection_reason' => $spouse->rejection_reason,
            ],
        ]);
    }

    /**
     * Get child full data for modal.
     */
    public function getChildData(EmployeeChild $child): JsonResponse
    {
        $child->load(['employee', 'submitter', 'approver']);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $child->id,
                'employee_name' => $child->employee?->full_name ?? 'غير محدد',
                'employee_number' => $child->employee?->employee_number ?? 'غير محدد',
                'full_name' => $child->full_name,
                'gender' => $child->gender ?? 'غير محدد',
                'id_number' => $child->id_number ?? 'غير محدد',
                'birth_date' => $child->birth_date ? $child->birth_date->format('Y-m-d') : null,
                'marital_status' => $child->marital_status ?? 'غير محدد',
                'is_working' => $child->is_working ? 'نعم' : 'لا',
                'is_university_student' => $child->is_university_student ? 'نعم' : 'لا',
                'notes' => $child->notes ?? 'لا توجد ملاحظات',
                'mother_full_name' => $child->mother_full_name ?? 'غير محدد',
                'mother_id_number' => $child->mother_id_number ?? 'غير محدد',
                'id_card_image' => $child->id_card_image,
                'birth_certificate_image' => $child->birth_certificate_image,
                'approval_status' => $child->approval_status,
                'submitted_by' => $child->submitter?->name ?? 'غير محدد',
                'submitted_at' => $child->created_at?->format('Y-m-d H:i'),
                'approved_by' => $child->approver?->name ?? 'غير محدد',
                'approved_at' => $child->approved_at?->format('Y-m-d H:i'),
                'rejection_reason' => $child->rejection_reason,
            ],
        ]);
    }

    /**
     * Get pending spouses data (AJAX).
     */
    public function getPendingSpouses(Request $request): JsonResponse
    {
        return $this->getSpousesData($request, 'pending');
    }

    /**
     * Get approved spouses data (AJAX).
     */
    public function getApprovedSpouses(Request $request): JsonResponse
    {
        return $this->getSpousesData($request, 'approved');
    }

    /**
     * Get rejected spouses data (AJAX).
     */
    public function getRejectedSpouses(Request $request): JsonResponse
    {
        return $this->getSpousesData($request, 'rejected');
    }

    /**
     * Get pending children data (AJAX).
     */
    public function getPendingChildren(Request $request): JsonResponse
    {
        return $this->getChildrenData($request, 'pending');
    }

    /**
     * Get approved children data (AJAX).
     */
    public function getApprovedChildren(Request $request): JsonResponse
    {
        return $this->getChildrenData($request, 'approved');
    }

    /**
     * Get rejected children data (AJAX).
     */
    public function getRejectedChildren(Request $request): JsonResponse
    {
        return $this->getChildrenData($request, 'rejected');
    }

    /**
     * Get spouses data for DataTables.
     */
    private function getSpousesData(Request $request, string $status): JsonResponse
    {
        $query = EmployeeSpouse::with(['employee', 'submitter', 'approver']);

        if ($status === 'pending') {
            $query->pending();
        } elseif ($status === 'approved') {
            $query->approved();
        } else {
            $query->rejected();
        }

        $totalRecords = (clone $query)->count();

        // Apply search
        if ($request->filled('search.value')) {
            $search = $request->input('search.value');
            $query->where(function ($q) use ($search) {
                $q->where('employee_spouses.full_name', 'ILIKE', "%{$search}%")
                    ->orWhere('employee_spouses.spouse_id_number', 'ILIKE', "%{$search}%")
                    ->orWhereHas('employee', function ($q) use ($search) {
                        $q->whereRaw("CONCAT_WS(' ', first_name, second_name, third_name, family_name) ILIKE ?", ["%{$search}%"]);
                    });
            });
        }

        $recordsFiltered = (clone $query)->count();

        // Apply ordering
        $orderColumn = $request->input('order.0.column', 0);
        $orderDir = $request->input('order.0.dir', 'desc');
        $columns = ['employee_name', 'full_name', 'marriage_date', 'created_at'];

        if (isset($columns[$orderColumn])) {
            if ($columns[$orderColumn] === 'employee_name') {
                $query->join('employees', 'employees.id', '=', 'employee_spouses.employee_id')
                    ->orderByRaw("CONCAT_WS(' ', employees.first_name, employees.second_name, employees.third_name, employees.family_name) {$orderDir}");
            } else {
                $query->orderBy($columns[$orderColumn], $orderDir);
            }
        } else {
            $query->latest($status === 'pending' ? 'created_at' : 'approved_at');
        }

        // Apply pagination
        $start = (int) $request->input('start', 0);
        $length = (int) $request->input('length', 10);
        $data = $query->skip($start)->take($length)->get();

        $formattedData = $data->map(function ($spouse, $index) use ($status) {
            $spouseId = $spouse->id;

            return [
                'DT_RowId' => "spouse_{$spouseId}",
                'employee_name' => $spouse->employee?->full_name ?? 'غير محدد',
                'full_name' => $spouse->full_name,
                'marriage_date' => $spouse->marriage_date ? $spouse->marriage_date->format('Y-m-d') : 'غير محدد',
                'date' => $status === 'pending'
                    ? $spouse->created_at->format('Y-m-d H:i')
                    : ($spouse->approved_at ? $spouse->approved_at->format('Y-m-d H:i') : 'غير محدد'),
                'approver' => $spouse->approver?->name ?? '-',
                'rejection_reason' => $spouse->rejection_reason ?? '-',
                'actions' => view('admin.family-approval.partials.spouse-actions', ['spouse' => $spouse, 'status' => $status])->render(),
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
     * Get children data for DataTables.
     */
    private function getChildrenData(Request $request, string $status): JsonResponse
    {
        $query = EmployeeChild::with(['employee', 'submitter', 'approver']);

        if ($status === 'pending') {
            $query->pending();
        } elseif ($status === 'approved') {
            $query->approved();
        } else {
            $query->rejected();
        }

        $totalRecords = (clone $query)->count();

        // Apply search
        if ($request->filled('search.value')) {
            $search = $request->input('search.value');
            $query->where(function ($q) use ($search) {
                $q->where('employee_children.full_name', 'ILIKE', "%{$search}%")
                    ->orWhere('employee_children.id_number', 'ILIKE', "%{$search}%")
                    ->orWhereHas('employee', function ($q) use ($search) {
                        $q->whereRaw("CONCAT_WS(' ', first_name, second_name, third_name, family_name) ILIKE ?", ["%{$search}%"]);
                    });
            });
        }

        $recordsFiltered = (clone $query)->count();

        // Apply ordering
        $orderColumn = $request->input('order.0.column', 0);
        $orderDir = $request->input('order.0.dir', 'desc');
        $columns = ['employee_name', 'full_name', 'birth_date', 'created_at'];

        if (isset($columns[$orderColumn])) {
            if ($columns[$orderColumn] === 'employee_name') {
                $query->join('employees', 'employees.id', '=', 'employee_children.employee_id')
                    ->orderByRaw("CONCAT_WS(' ', employees.first_name, employees.second_name, employees.third_name, employees.family_name) {$orderDir}");
            } else {
                $query->orderBy($columns[$orderColumn], $orderDir);
            }
        } else {
            $query->latest($status === 'pending' ? 'created_at' : 'approved_at');
        }

        // Apply pagination
        $start = (int) $request->input('start', 0);
        $length = (int) $request->input('length', 10);
        $data = $query->skip($start)->take($length)->get();

        $formattedData = $data->map(function ($child, $index) use ($status) {
            $childId = $child->id;

            return [
                'DT_RowId' => "child_{$childId}",
                'employee_name' => $child->employee?->full_name ?? 'غير محدد',
                'full_name' => $child->full_name,
                'birth_date' => $child->birth_date ? $child->birth_date->format('Y-m-d') : 'غير محدد',
                'date' => $status === 'pending'
                    ? $child->created_at->format('Y-m-d H:i')
                    : ($child->approved_at ? $child->approved_at->format('Y-m-d H:i') : 'غير محدد'),
                'approver' => $child->approver?->name ?? '-',
                'rejection_reason' => $child->rejection_reason ?? '-',
                'actions' => view('admin.family-approval.partials.child-actions', ['child' => $child, 'status' => $status])->render(),
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
     * Approve a spouse.
     */
    public function approveSpouse(EmployeeSpouse $spouse): RedirectResponse
    {
        $spouse->update([
            'approval_status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        return redirect()
            ->route('admin.family-approval.index')
            ->with('success', 'تم الموافقة على بيانات الزوج/الزوجة بنجاح.');
    }

    /**
     * Reject a spouse.
     */
    public function rejectSpouse(Request $request, EmployeeSpouse $spouse): RedirectResponse
    {
        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $spouse->update([
            'approval_status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $request->rejection_reason,
        ]);

        return redirect()
            ->route('admin.family-approval.index')
            ->with('success', 'تم رفض بيانات الزوج/الزوجة.');
    }

    /**
     * Approve a child.
     */
    public function approveChild(EmployeeChild $child): RedirectResponse
    {
        $child->update([
            'approval_status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        return redirect()
            ->route('admin.family-approval.index')
            ->with('success', 'تم الموافقة على بيانات الابن/الابنة بنجاح.');
    }

    /**
     * Reject a child.
     */
    public function rejectChild(Request $request, EmployeeChild $child): RedirectResponse
    {
        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $child->update([
            'approval_status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $request->rejection_reason,
        ]);

        return redirect()
            ->route('admin.family-approval.index')
            ->with('success', 'تم رفض بيانات الابن/الابنة.');
    }
}
