<?php

namespace App\Http\Controllers\Employee\Family;

use App\Models\Employee;
use Illuminate\Http\Request;
use App\Models\EmployeeDependent;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\StoreDependentRequest;
use App\Http\Requests\UpdateDependentRequest;
use Illuminate\Database\Eloquent\ModelNotFoundException;


class EmployeeDependentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $dependents = EmployeeDependent::with('employee:id,first_name,second_name,third_name,family_name')
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'تم جلب جميع بيانات المعالين بنجاح.',
            'data' => $dependents
        ]);
    }

    public function indexForEmployee(Employee $employee): JsonResponse
    {
        $dependents = EmployeeDependent::where('employee_id', $employee->id)
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'تم جلب معالي الموظف بنجاح.',
            'data' => $dependents,
            'employee' => [
                'id' => $employee->id,
                'full_name' => trim("{$employee->first_name} {$employee->second_name} {$employee->third_name} {$employee->family_name}")
            ]
        ]);
    }

    public function store(StoreDependentRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('dependency_proof')) {
            $file = $request->file('dependency_proof');
            $data['dependency_proof_path'] = $file->store('dependency_proofs', 'public');
        }

        $approvalData = [];
        if (auth()->user()->can('manage-profile-requests')) {
            $approvalData = [
                'approval_status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ];
        } else {
            $approvalData = [
                'approval_status' => 'pending',
            ];
        }

        $dependent = EmployeeDependent::create([
            ...$data,
            ...$approvalData,
            'submitted_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة بيانات المعال بنجاح.',
            'data' => $dependent->load('employee:id,first_name,second_name,third_name,family_name')
        ], 201);
    }

    public function show(EmployeeDependent $dependent): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'تم جلب بيانات المعال بنجاح.',
            'data' => $dependent->load('employee:id,first_name,second_name,third_name,family_name')
        ]);
    }

    public function update(UpdateDependentRequest $request, EmployeeDependent $dependent): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('dependency_proof')) {
            if ($dependent->dependency_proof_path) {
                Storage::disk('public')->delete($dependent->dependency_proof_path);
            }

            $data['dependency_proof_path'] = $request->file('dependency_proof')
                ->store('dependency_proofs', 'public');
        }

        if (auth()->user()->can('manage-profile-requests')) {
            $data['approval_status'] = 'approved';
            $data['approved_by'] = auth()->id();
            $data['approved_at'] = now();
        } else {
            $data['approval_status'] = 'pending';
            $data['submitted_by'] = auth()->id();
        }

        $dependent->update($data);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات المعال بنجاح.',
            'data' => $dependent->load('employee:id,first_name,second_name,third_name,family_name')
        ]);
    }

    public function destroy(EmployeeDependent $dependent): JsonResponse
    {
        if ($dependent->dependency_proof_path) {
            Storage::disk('public')->delete($dependent->dependency_proof_path);
        }

        $dependent->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف بيانات المعال بنجاح.'
        ]);
    }

    public function showDeleted(): JsonResponse
{
    $dependents = EmployeeDependent::onlyTrashed()
        ->latest()
        ->paginate(15);

    return response()->json([
        'success' => true,
        'message' => 'تم جلب المعالين المحذوفين بنجاح.',
        'data' => $dependents
    ]);
}

public function restore(int $id): JsonResponse
{
    $dependent = EmployeeDependent::onlyTrashed()->find($id);

    if (! $dependent) {
        return response()->json([
            'success' => false,
            'message' => 'المعال غير موجود أو لم يتم حذفه.'
        ], 404);
    }

    $dependent->restore();

    return response()->json([
        'success' => true,
        'message' => 'تم استرجاع بيانات المعال بنجاح.',
        'data' => $dependent
    ]);
}

public function showWithDeleted()
{
    $dependents = EmployeeDependent::withTrashed()
        ->latest()
        ->paginate(15);

    return response()->json([
        'success' => true,
        'message' => 'تم جلب جميع المعالين بما فيهم المحذوفين مؤقتاً.',
        'data' => $dependents,
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

    $dependents = $employee->dependents()->latest()->get()->map(function ($dependent) {
        return [
            'id' => $dependent->id,
            'full_name' => $dependent->full_name,
            'dependent_id_number' => $dependent->dependent_id_number,
            'birth_date' => $dependent->birth_date?->format('Y-m-d'),
            'mobile' => $dependent->mobile,
            'relationship' => $dependent->relationship,
            'address' => $dependent->address,
            'gender' => $dependent->gender,
            'notes' => $dependent->notes,
            'approval_status' => $dependent->approval_status,
            'rejection_reason' => $dependent->rejection_reason,
            'approval_status_ar' => $this->getArabicStatus($dependent->approval_status),
            'dependency_proof_url' => $dependent->dependency_proof_path ? Storage::disk('public')->url($dependent->dependency_proof_path) : null,
        ];
    });

    return response()->json([
        'success' => true,
        'data' => $dependents
    ]);
}

public function storeForAuthenticatedEmployee(Request $request): JsonResponse
{
    $employee = $request->user()->employee;
    if (!$employee) {
        return response()->json(['success' => false, 'message' => 'Employee record not found'], 404);
    }

    $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
        'full_name' => ['required', 'string', 'max:255'],
        'dependent_id_number' => ['required', 'string', 'max:50'],
        'birth_date' => ['required', 'date'],
        'mobile' => ['nullable', 'string', 'max:20'],
        'relationship' => ['required', 'string', 'max:100'],
        'address' => ['required', 'string', 'max:255'],
        'gender' => ['required', 'string', 'in:ذكر,أنثى'],
        'notes' => ['nullable', 'string'],
        'dependency_proof_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'], // Max 5MB
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

    if ($request->hasFile('dependency_proof_file')) {
        $file = $request->file('dependency_proof_file');
        $path = $file->store('dependents/proofs', 'public');
        $data['dependency_proof_path'] = $path;
    }

    $dependent = EmployeeDependent::create($data);

    return response()->json([
        'success' => true,
        'message' => 'تم إرسال البيانات بنجاح، وهي قيد الانتظار للموافقة عليها من قبل الإدارة.',
        'data' => $dependent
    ]);
}

public function updateForAuthenticatedEmployee(Request $request, $id): JsonResponse
{
    $employee = $request->user()->employee;
    if (!$employee) {
        return response()->json(['success' => false, 'message' => 'Employee record not found'], 404);
    }

    $dependent = $employee->dependents()->find($id);
    if (!$dependent) {
        return response()->json(['success' => false, 'message' => 'Dependent record not found'], 404);
    }

    $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
        'full_name' => ['sometimes', 'string', 'max:255'],
        'dependent_id_number' => ['sometimes', 'string', 'max:50'],
        'birth_date' => ['sometimes', 'date'],
        'mobile' => ['nullable', 'string', 'max:20'],
        'relationship' => ['sometimes', 'string', 'max:100'],
        'address' => ['sometimes', 'string', 'max:255'],
        'gender' => ['sometimes', 'string', 'in:ذكر,أنثى'],
        'notes' => ['nullable', 'string'],
        'dependency_proof_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    $data = $validator->validated();
    $data['approval_status'] = 'pending';

    if ($request->hasFile('dependency_proof_file')) {
        if ($dependent->dependency_proof_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($dependent->dependency_proof_path);
        }
        $file = $request->file('dependency_proof_file');
        $path = $file->store('dependents/proofs', 'public');
        $data['dependency_proof_path'] = $path;
    }

    $dependent->update($data);

    return response()->json([
        'success' => true,
        'message' => 'تم تحديث البيانات بنجاح، وهي قيد الانتظار للموافقة عليها من قبل الإدارة.',
        'data' => $dependent
    ]);
}

public function destroyForAuthenticatedEmployee(Request $request, $id): JsonResponse
{
    $employee = $request->user()->employee;
    if (!$employee) {
        return response()->json(['success' => false, 'message' => 'Employee record not found'], 404);
    }

    $dependent = $employee->dependents()->find($id);
    if (!$dependent) {
        return response()->json(['success' => false, 'message' => 'Dependent record not found'], 404);
    }

    $dependent->delete();

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
