<?php

namespace Modules\EmployeeDegree\Http\Controllers;

use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Modules\EmployeeDegree\Models\EmployeeDegree;
use Modules\EmployeeDegree\Http\Requests\StoreEmployeeDegreeRequest;
use Modules\EmployeeDegree\Http\Requests\UpdateEmployeeDegreeRequest;

use Illuminate\Http\Request;

class EmployeeDegreeController extends Controller
{
    /**
     * Approve an employee degree.
     */
    public function approve(EmployeeDegree $employeeDegree): JsonResponse
    {
        $employeeDegree->update([
            'approval_status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم الموافقة على الشهادة بنجاح.',
        ]);
    }

    /**
     * Reject an employee degree.
     */
    public function reject(Request $request, EmployeeDegree $employeeDegree): JsonResponse
    {
        $employeeDegree->update([
            'approval_status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم رفض الشهادة.',
        ]);
    }

    public function store(StoreEmployeeDegreeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = auth()->user();

        // If not admin, force their own employee_id and set status to pending
        if (!$user->can('manage-profile-requests')) {
            $data['employee_id'] = $user->employee ? $user->employee->id : null;
            $data['approval_status'] = 'pending';
        } else {
            // Admin can set status directly if they want, but default to approved for admin additions
            $data['approval_status'] = $data['approval_status'] ?? 'approved';
        }

        if ($request->hasFile('certificate_attachment')) {
            $data['certificate_attachment'] = $request->file('certificate_attachment')->store('employee_degrees', 'public');
        }

        $data['submitted_by'] = $user->id;

        $degree = EmployeeDegree::create($data);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الشهادة بنجاح، بانتظار مراجعة الإدارة.',
            'data' => $degree,
        ], 201);
    }

    public function update(UpdateEmployeeDegreeRequest $request, EmployeeDegree $employeeDegree): JsonResponse
    {
        $user = auth()->user();

        if (!$user->can('manage-profile-requests')) {
            if ($employeeDegree->employee_id !== ($user->employee->id ?? null)) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بتعديل هذه الشهادة.',
                ], 403);
            }
        }

        $data = $request->validated();
        if (auth()->user()->can('manage-profile-requests')) {
            $data['approval_status'] = 'approved';
            $data['approved_by'] = auth()->id();
            $data['approved_at'] = now();
        } else {
            $data['approval_status'] = 'pending'; // Re-verify on edit
        }

        if ($request->hasFile('certificate_attachment')) {
            $data['certificate_attachment'] = $request->file('certificate_attachment')->store('employee_degrees', 'public');
        }

        $employeeDegree->update($data);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الشهادة بنجاح، بانتظار المراجعة.',
            'data' => $employeeDegree,
        ]);
    }

    public function delete(EmployeeDegree $employeeDegree): JsonResponse
    {
        $user = auth()->user();

        if (!$user->can('manage-profile-requests')) {
            if ($employeeDegree->employee_id !== ($user->employee->id ?? null)) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بحذف هذه الشهادة.',
                ], 403);
            }
        }

        $employeeDegree->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الشهادة بنجاح.',
        ]);
    }

    public function showAll(): JsonResponse
    {
        $degrees = EmployeeDegree::all();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب جميع الشهادات بنجاح.',
            'data' => $degrees,
        ]);
    }

    public function show($id): JsonResponse
    {
        $degree = EmployeeDegree::find($id);

        if (!$degree) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على الشهادة.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الشهادة بنجاح.',
            'data' => $degree,
        ]);
    }

    public function employeeIdDegree($employeeId): JsonResponse
    {
        $degrees = EmployeeDegree::where('employee_id', $employeeId)->get();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب شهادات الموظف بنجاح.',
            'data' => $degrees,
        ]);
    }

    public function showAllDeleted(): JsonResponse
    {
        $degrees = EmployeeDegree::onlyTrashed()->get();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الشهادات المحذوفة بنجاح.',
            'data' => $degrees,
        ]);
    }

    public function showAllWithDeleted(): JsonResponse
    {
        // Filter by pending status and ensure employee exists at the query level
        $degrees = EmployeeDegree::with(['employee', 'qualification'])
            ->where('approval_status', 'pending')
            ->whereHas('employee')
            ->get();

        $formatted = $degrees->map(function ($degree) {
            return [
                'id' => $degree->id,
                'employee_id' => $degree->employee_id,
                'employee_name' => $degree->employee?->full_name,
                'national_id' => $degree->employee?->national_id,
                'degree' => $degree->qualification?->value,
                'major_name' => $degree->major_name,
                'university_name' => $degree->university_name,
                'graduation_year' => $degree->graduation_year,
                'grade' => $degree->grade,
                'notes' => $degree->notes,
                'certificate_attachment' => $degree->certificate_attachment,
                'approval_status' => $degree->approval_status,
                'created_at' => $degree->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'تم جلب طلبات الشهادات المعلقة بنجاح.',
            'data' => $formatted,
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $degree = EmployeeDegree::onlyTrashed()->findOrFail($id);
        $degree->restore();

        return response()->json([
            'success' => true,
            'message' => 'تم استرجاع الشهادة بنجاح.',
        ]);
    }
}
