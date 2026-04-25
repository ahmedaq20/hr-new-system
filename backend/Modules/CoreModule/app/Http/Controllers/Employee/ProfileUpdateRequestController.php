<?php

namespace Modules\CoreModule\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\ProfileUpdateRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProfileUpdateRequestController extends Controller
{
    /**
     * Submit a new profile update request (Employee).
     */
    public function store(Request $request): JsonResponse
    {
        $employee = $request->user()->employee;
        if (!$employee) {
            return response()->json(['success' => false, 'message' => 'Employee record not found'], 404);
        }

        // Check if there is already a pending request
        $existingRequest = ProfileUpdateRequest::where('employee_id', $employee->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json([
                'success' => false,
                'message' => 'لديك طلب تعديل قيد الانتظار بالفعل. يرجى انتظار معالجة الطلب الحالي.'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'requested_changes' => 'required|array',
            'requested_changes.primary_phone' => 'sometimes|nullable|string|max:20',
            'requested_changes.secondary_phone' => 'sometimes|nullable|string|max:20',
            'requested_changes.address' => 'sometimes|nullable|string|max:255',
            'requested_changes.marital_status' => 'sometimes|nullable|string|max:50',
            'requested_changes.gender' => 'sometimes|nullable|string|max:20',
            'requested_changes.email' => 'sometimes|nullable|email|max:255',
            'requested_changes.governorate_id' => 'sometimes|nullable|integer|exists:governorates,id',
            'requested_changes.city_id' => 'sometimes|nullable|integer|exists:cities,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $profileRequest = ProfileUpdateRequest::create([
            'employee_id' => $employee->id,
            'requested_changes' => $request->requested_changes,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال طلب التعديل بنجاح، وهو قيد المراجعة من قبل الإدارة.',
            'data' => $profileRequest
        ]);
    }

    /**
     * List requests for admins.
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->input('status', 'pending');

        $requests = ProfileUpdateRequest::with(['employee.user', 'approver'])
            ->when($status !== 'all', function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate($request->input('per_page', 100));

        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }

    /**
     * Approve a request (Admin).
     */
    public function approve(Request $request, $id): JsonResponse
    {
        $profileRequest = ProfileUpdateRequest::findOrFail($id);

        if (!$profileRequest->isPending()) {
            return response()->json(['success' => false, 'message' => 'الطلب غير متاح للمعالجة'], 422);
        }

        DB::transaction(function () use ($profileRequest, $request) {
            $employee = $profileRequest->employee;
            
            $changes = $profileRequest->requested_changes;

            // Map Arabic values to English enums as the DB expects ENUM('married','single','divorced','widowed')
            if (isset($changes['marital_status'])) {
                $maritalStatusMap = [
                    'أعزب/عزباء' => 'single',
                    'أعزب' => 'single',
                    'عزباء' => 'single',
                    'متزوج/متزوجة' => 'married',
                    'متزوج' => 'married',
                    'متزوجة' => 'married',
                    'مطلق/مطلقة' => 'divorced',
                    'مطلق' => 'divorced',
                    'مطلقة' => 'divorced',
                    'أرمل/أرملة' => 'widowed',
                    'أرمل' => 'widowed',
                    'أرملة' => 'widowed',
                ];
                if (isset($maritalStatusMap[$changes['marital_status']])) {
                    $changes['marital_status'] = $maritalStatusMap[$changes['marital_status']];
                }
            }

            if (isset($changes['gender'])) {
                $genderMap = [
                    'ذكر' => 'male',
                    'أنثى' => 'female',
                ];
                if (isset($genderMap[$changes['gender']])) {
                    $changes['gender'] = $genderMap[$changes['gender']];
                }
            }

            // Apply changes to employee model
            $employee->update($changes);

            // Mark request as approved
            $profileRequest->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'تمت الموافقة على الطلب وتحديث بيانات الموظف بنجاح.'
        ]);
    }

    /**
     * Reject a request (Admin).
     */
    public function reject(Request $request, $id): JsonResponse
    {
        $profileRequest = ProfileUpdateRequest::findOrFail($id);

        if (!$profileRequest->isPending()) {
            return response()->json(['success' => false, 'message' => 'الطلب غير متاح للمعالجة'], 422);
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $profileRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم رفض طلب التعديل.'
        ]);
    }
}
