<?php

namespace App\Http\Controllers\Employee\Family;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeChildRequest;
use App\Http\Requests\UpdateEmployeeChildRequest;
use App\Models\Employee;
use App\Models\EmployeeChild;
use App\Services\ChildTableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class EmployeeChildController extends Controller
{
    public function __construct(private ChildTableService $childTableService) {}

    public function data(Request $request): JsonResponse
    {
        $payload = $this->childTableService->handle($request);

        return response()->json([
            'success' => true,
            'message' => 'تم جلب بيانات الجدول بنجاح.',
            'data' => $payload,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $children = EmployeeChild::with('employee:id,first_name,second_name,third_name,family_name')
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'تم جلب جميع الأطفال بنجاح.',
            'data' => $children
        ]);
    }

    public function indexForEmployee(Employee $employee): JsonResponse
    {
        $children = EmployeeChild::where('employee_id', $employee->id)
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'تم جلب أطفال الموظف بنجاح.',
            'data' => $children,
            'employee' => [
                'id' => $employee->id,
                'full_name' => trim($employee->first_name . ' ' . $employee->second_name . ' ' . $employee->third_name . ' ' . $employee->family_name)
            ]
        ]);
    }

    public function store(StoreEmployeeChildRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Set default approval status
        if (auth()->user()->can('manage-profile-requests')) {
            $data['approval_status'] = 'approved';
            $data['approved_by'] = auth()->id();
            $data['approved_at'] = now();
        } else {
            $data['approval_status'] = 'pending';
        }

        $data['submitted_by'] = auth()->id() ?? null;

        // Handle ID card image upload
        if ($request->hasFile('id_card_image')) {
            $file = $request->file('id_card_image');
            $directory = 'child_id_cards';
            $fileName = time() . '_id_card_' . str()->slug($file->getClientOriginalName()) . '.' . $file->getClientOriginalExtension();
            $data['id_card_image'] = $file->storeAs($directory, $fileName, 'public');
        }

        // Handle birth certificate image upload
        if ($request->hasFile('birth_certificate_image')) {
            $file = $request->file('birth_certificate_image');
            $directory = 'child_birth_certificates';
            $fileName = time() . '_birth_cert_' . str()->slug($file->getClientOriginalName()) . '.' . $file->getClientOriginalExtension();
            $data['birth_certificate_image'] = $file->storeAs($directory, $fileName, 'public');
        }

        $child = EmployeeChild::create($data);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة بيانات الابن/الابنة بنجاح.',
            'data' => $child->load('employee:id,first_name,second_name,third_name,family_name')
        ], 201);
    }

    public function show(EmployeeChild $child): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'تم جلب بيانات الطفل بنجاح.',
            'data' => $child->load('employee:id,first_name,second_name,third_name,family_name')
        ]);
    }

    public function update(UpdateEmployeeChildRequest $request, EmployeeChild $child): JsonResponse
    {
        $data = $request->validated();

        // If updating, set status back to pending if it was approved/rejected (non-admin only)
        if (!auth()->user()->can('manage-profile-requests')) {
            if ($child->isApproved() || $child->isRejected()) {
                $data['approval_status'] = 'pending';
                $data['submitted_by'] = auth()->id() ?? null;
            }
        } else {
            // Admin updates stay approved
            $data['approval_status'] = 'approved';
            $data['approved_by'] = auth()->id();
            $data['approved_at'] = now();
        }

        // Handle ID card image upload
        if ($request->hasFile('id_card_image')) {
            if ($child->id_card_image) {
                Storage::disk('public')->delete($child->id_card_image);
            }

            $file = $request->file('id_card_image');
            $directory = 'child_id_cards';
            $fileName = time() . '_id_card_' . str()->slug($file->getClientOriginalName()) . '.' . $file->getClientOriginalExtension();
            $data['id_card_image'] = $file->storeAs($directory, $fileName, 'public');
        }

        // Handle birth certificate image upload
        if ($request->hasFile('birth_certificate_image')) {
            $data['birth_certificate_image'] = $file->storeAs($directory, $fileName, 'public');
        }

        // Handle university certificate image upload
        if ($request->hasFile('university_certificate_image')) {
            if ($child->university_certificate_image) {
                Storage::disk('public')->delete($child->university_certificate_image);
            }

            $file = $request->file('university_certificate_image');
            $directory = 'child_university_certificates';
            $fileName = time() . '_univ_cert_' . str()->slug($file->getClientOriginalName()) . '.' . $file->getClientOriginalExtension();
            $data['university_certificate_image'] = $file->storeAs($directory, $fileName, 'public');
        }

        $child->update($data);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الابن/الابنة بنجاح.',
            'data' => $child->load('employee:id,first_name,second_name,third_name,family_name')
        ]);
    }


    public function showAllWithDeleted(Request $request): JsonResponse
    {
        $children = EmployeeChild::withTrashed()
            ->with('employee:id,first_name,second_name,third_name,family_name')
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'تم جلب جميع الأطفال مع المحذوفين بنجاح.',
            'data' => $children,
        ]);
    }

    // عرض طفل محذوف مؤقتًا (soft deleted) فقط
    public function showDeletedChild($id): JsonResponse
    {
        $child = EmployeeChild::onlyTrashed()->with('employee:id,first_name,second_name,third_name,family_name')->find($id);

        if (!$child) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على بيانات الطفل المحذوف.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب بيانات الطفل المحذوف بنجاح.',
            'data' => $child,
        ]);
    }

    // استرجاع طفل محذوف مؤقتًا
    public function restore($id): JsonResponse
    {
        $child = EmployeeChild::onlyTrashed()->find($id);

        if (!$child) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على بيانات الطفل المحذوف للاسترجاع.',
            ], 404);
        }

        $child->restore();

        return response()->json([
            'success' => true,
            'message' => 'تم استرجاع بيانات الابن/الابنة بنجاح.',
            'data' => $child->load('employee:id,first_name,second_name,third_name,family_name')
        ]);
    }

    public function destroy(EmployeeChild $child): JsonResponse
    {
        $child->delete(); //  حذف مؤقت (soft delete)

        return response()->json([
            'success' => true,
            'message' => 'تم حذف بيانات الابن/الابنة مؤقتًا بنجاح.'
        ]);
    }

    public function showDeletedChildren(): JsonResponse
    {
        $deletedChildren = EmployeeChild::onlyTrashed()->with('employee:id,first_name,second_name,third_name,family_name')->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'تم جلب بيانات الأطفال المحذوفين بنجاح.',
            'data' => $deletedChildren
        ]);
    }

    /* ========================================================================
     |  Authenticated Employee Methods
     ======================================================================== */

    public function indexForAuthenticatedEmployee(Request $request): JsonResponse
    {
        $employee = $request->user()->employee;
        if (!$employee) {
            return response()->json(['success' => false, 'message' => 'Employee record not found'], 404);
        }

        $children = $employee->children()->latest()->get()->map(function ($child) {
            return [
                'id' => $child->id,
                'full_name' => $child->full_name,
                'gender' => $child->gender,
                'id_number' => $child->id_number,
                'birth_date' => $child->birth_date?->format('Y-m-d'),
                'marital_status' => $child->marital_status,
                'is_working' => $child->is_working,
                'is_university_student' => $child->is_university_student,
                'mother_full_name' => $child->mother_full_name,
                'mother_id_number' => $child->mother_id_number,
                'notes' => $child->notes,
                'approval_status' => $child->approval_status,
                'rejection_reason' => $child->rejection_reason,
                'approval_status_ar' => $this->getArabicStatus($child->approval_status),
                'id_card_image_url' => $child->id_card_image ? Storage::disk('public')->url($child->id_card_image) : null,
                'birth_certificate_image_url' => $child->birth_certificate_image ? Storage::disk('public')->url($child->birth_certificate_image) : null,
                'university_certificate_image_url' => $child->university_certificate_image ? Storage::disk('public')->url($child->university_certificate_image) : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $children
        ]);
    }

    public function storeForAuthenticatedEmployee(Request $request): JsonResponse
    {
        $employee = $request->user()->employee;
        if (!$employee) {
            return response()->json(['success' => false, 'message' => 'Employee record not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'string', 'in:ذكر,أنثى'],
            'id_number' => ['required', 'string', 'max:50'],
            'birth_date' => ['required', 'date'],
            'marital_status' => ['required', 'string'],
            'is_working' => ['required', 'boolean'],
            'is_university_student' => ['required', 'boolean'],
            'mother_full_name' => ['required', 'string', 'max:255'],
            'mother_id_number' => ['required', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'id_card_image' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'], // Max 5MB
            'birth_certificate_image' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'], // Max 5MB
            'university_certificate_image' => ['required_if:is_university_student,true,1', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['employee_id'] = $employee->id;
        $data['approval_status'] = 'pending';
        $data['submitted_by'] = $request->user()->id;

        if ($request->hasFile('id_card_image')) {
            $file = $request->file('id_card_image');
            $fileName = time() . '_id_card_' . str()->slug($file->getClientOriginalName()) . '.' . $file->getClientOriginalExtension();
            $data['id_card_image'] = $file->storeAs('child_id_cards', $fileName, 'public');
        }

        if ($request->hasFile('birth_certificate_image')) {
            $file = $request->file('birth_certificate_image');
            $fileName = time() . '_birth_cert_' . str()->slug($file->getClientOriginalName()) . '.' . $file->getClientOriginalExtension();
            $data['birth_certificate_image'] = $file->storeAs('child_birth_certificates', $fileName, 'public');
        }

        if ($request->hasFile('university_certificate_image')) {
            $file = $request->file('university_certificate_image');
            $fileName = time() . '_univ_cert_' . str()->slug($file->getClientOriginalName()) . '.' . $file->getClientOriginalExtension();
            $data['university_certificate_image'] = $file->storeAs('child_university_certificates', $fileName, 'public');
        }

        $child = EmployeeChild::create($data);

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال البيانات بنجاح، وهي قيد الانتظار للموافقة عليها من قبل الإدارة.',
            'data' => $child
        ]);
    }

    public function updateForAuthenticatedEmployee(Request $request, $id): JsonResponse
    {
        $employee = $request->user()->employee;
        if (!$employee) {
            return response()->json(['success' => false, 'message' => 'Employee record not found'], 404);
        }

        $child = $employee->children()->find($id);
        if (!$child) {
            return response()->json(['success' => false, 'message' => 'Child record not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => ['sometimes', 'string', 'max:255'],
            'gender' => ['sometimes', 'string', 'in:ذكر,أنثى'],
            'id_number' => ['sometimes', 'string', 'max:50'],
            'birth_date' => ['sometimes', 'date'],
            'marital_status' => ['sometimes', 'string'],
            'is_working' => ['sometimes', 'boolean'],
            'is_university_student' => ['sometimes', 'boolean'],
            'mother_full_name' => ['sometimes', 'string', 'max:255'],
            'mother_id_number' => ['sometimes', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'id_card_image' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'birth_certificate_image' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'university_certificate_image' => [
                ($request->is_university_student && !$child->university_certificate_image) ? 'required' : 'nullable', 
                'file', 
                'mimes:pdf,jpg,jpeg,png', 
                'max:5120'
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['approval_status'] = 'pending';
        $data['submitted_by'] = $request->user()->id;

        if ($request->hasFile('id_card_image')) {
            if ($child->id_card_image) {
                Storage::disk('public')->delete($child->id_card_image);
            }
            $file = $request->file('id_card_image');
            $fileName = time() . '_id_card_' . str()->slug($file->getClientOriginalName()) . '.' . $file->getClientOriginalExtension();
            $data['id_card_image'] = $file->storeAs('child_id_cards', $fileName, 'public');
        }

        if ($request->hasFile('birth_certificate_image')) {
            if ($child->birth_certificate_image) {
                Storage::disk('public')->delete($child->birth_certificate_image);
            }
            $file = $request->file('birth_certificate_image');
            $fileName = time() . '_birth_cert_' . str()->slug($file->getClientOriginalName()) . '.' . $file->getClientOriginalExtension();
            $data['birth_certificate_image'] = $file->storeAs('child_birth_certificates', $fileName, 'public');
        }

        if ($request->hasFile('university_certificate_image')) {
            if ($child->university_certificate_image) {
                Storage::disk('public')->delete($child->university_certificate_image);
            }
            $file = $request->file('university_certificate_image');
            $fileName = time() . '_univ_cert_' . str()->slug($file->getClientOriginalName()) . '.' . $file->getClientOriginalExtension();
            $data['university_certificate_image'] = $file->storeAs('child_university_certificates', $fileName, 'public');
        }

        $child->update($data);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث البيانات بنجاح، وهي قيد الانتظار للموافقة عليها من قبل الإدارة.',
            'data' => $child
        ]);
    }

    public function destroyForAuthenticatedEmployee(Request $request, $id): JsonResponse
    {
        $employee = $request->user()->employee;
        if (!$employee) {
            return response()->json(['success' => false, 'message' => 'Employee record not found'], 404);
        }

        $child = $employee->children()->find($id);
        if (!$child) {
            return response()->json(['success' => false, 'message' => 'Child record not found'], 404);
        }

        $child->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف البيانات بنجاح.'
        ]);
    }

    private function getArabicStatus(string $status): string
    {
        return match ($status) {
            'pending' => 'انتظار الموافقة',
            'approved' => 'مقبول',
            'rejected' => 'مرفوض',
            default => $status,
        };
    }
}
