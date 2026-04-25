<?php

namespace App\Http\Controllers\Employee\Family;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeSpouse;
use App\Services\SpouseTableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class EmployeeSpouseController extends Controller
{
    protected SpouseTableService $service;

    public function __construct(SpouseTableService $service)
    {
        $this->service = $service;
    }

    public function data(Request $request): JsonResponse
    {
        return response()->json($this->service->handle($request));
    }

    public function indexForEmployee(Employee $employee, Request $request): JsonResponse
    {
        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 15);

        $paginated = $employee->spouses()->latest()->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'data' => $paginated->items(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ]
        ]);
    }

    public function store(Request $request, Employee $employee): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'full_name' => ['required','string','max:255'],
            'marriage_date' => ['required','date'],
            'spouse_id_number' => ['required','string','max:50'],
            'marital_status' => ['required','string','in:متزوج,أرمل,مطلّق'],
            'is_working' => ['required','boolean'],
            'work_sector' => ['nullable','string','in:خاص,حكومة,مؤسسة دولية'],
            'private_company_name' => ['nullable','string','max:255'],
            'international_organization_name' => ['nullable','string','max:255'],
            'mobile' => ['nullable','string','max:20'],
        ])->validate();

        $validated['employee_id'] = $employee->id;
        if (auth()->user()->can('manage-profile-requests')) {
            $validated['approval_status'] = 'approved';
            $validated['approved_by'] = auth()->id();
            $validated['approved_at'] = now();
        } else {
            $validated['approval_status'] = 'pending';
        }
        $validated['submitted_by'] = auth()->id() ?? null;
        
        $spouse = EmployeeSpouse::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الزوجة بنجاح',
            'data' => $spouse
        ]);
    }

    public function update(Request $request, Employee $employee, EmployeeSpouse $spouse): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'full_name' => ['sometimes','string','max:255'],
            'marriage_date' => ['sometimes','date'],
            'spouse_id_number' => ['sometimes','string','max:50'],
            'marital_status' => ['sometimes','string','in:متزوج,أرمل,مطلّق'],
            'is_working' => ['sometimes','boolean'],
            'work_sector' => ['nullable','string','in:خاص,حكومة,مؤسسة دولية'],
            'private_company_name' => ['nullable','string','max:255'],
            'international_organization_name' => ['nullable','string','max:255'],
            'mobile' => ['nullable','string','max:20'],
        ])->validate();

        if (auth()->user()->can('manage-profile-requests')) {
            $validated['approval_status'] = 'approved';
            $validated['approved_by'] = auth()->id();
            $validated['approved_at'] = now();
        } else {
            $validated['approval_status'] = 'pending';
            $validated['submitted_by'] = auth()->id() ?? null;
        }

        $spouse->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الزوجة بنجاح',
            'data' => $spouse
        ]);
    }

    public function destroy(Employee $employee, EmployeeSpouse $spouse): JsonResponse
    {
        $spouse->delete();
        return response()->json([
            'success' => true,
            'message' => 'تم حذف الزوجة بنجاح'
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

        $spouses = $employee->spouses()->latest()->get()->map(function ($spouse) {
            return [
                'id' => $spouse->id,
                'full_name' => $spouse->full_name,
                'spouse_id_number' => $spouse->spouse_id_number,
                'birth_date' => $spouse->birth_date?->format('Y-m-d'),
                'marriage_date' => $spouse->marriage_date?->format('Y-m-d'),
                'marital_status' => $spouse->marital_status,
                'is_working' => $spouse->is_working,
                'mobile' => $spouse->mobile,
                'approval_status' => $spouse->approval_status,
                'rejection_reason' => $spouse->rejection_reason,
                'approval_status_ar' => $this->getArabicStatus($spouse->approval_status),
                'marriage_contract_url' => $spouse->marriage_contract_path ? Storage::disk('public')->url($spouse->marriage_contract_path) : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $spouses
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
            'spouse_id_number' => ['required', 'string', 'max:50'],
            'birth_date' => ['required', 'date'],
            'marriage_date' => ['required', 'date'],
            'marital_status' => ['required', 'string'],
            'mobile' => ['nullable', 'string', 'max:20'],
            'is_working' => ['required', 'boolean'],
            'marriage_contract_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'], // Max 5MB
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

        if ($request->hasFile('marriage_contract_file')) {
            $file = $request->file('marriage_contract_file');
            $path = $file->store('spouses/contracts', 'public');
            $data['marriage_contract_path'] = $path;
        }

        $spouse = EmployeeSpouse::create($data);

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال البيانات بنجاح، وهي قيد الانتظار للموافقة عليها من قبل الإدارة.',
            'data' => $spouse
        ]);
    }

    public function updateForAuthenticatedEmployee(Request $request, $id): JsonResponse
    {
        $employee = $request->user()->employee;
        if (!$employee) {
            return response()->json(['success' => false, 'message' => 'Employee record not found'], 404);
        }

        $spouse = $employee->spouses()->find($id);
        if (!$spouse) {
            return response()->json(['success' => false, 'message' => 'Spouse record not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => ['sometimes', 'string', 'max:255'],
            'spouse_id_number' => ['sometimes', 'string', 'max:50'],
            'birth_date' => ['sometimes', 'date'],
            'marriage_date' => ['sometimes', 'date'],
            'marital_status' => ['sometimes', 'string'],
            'mobile' => ['nullable', 'string', 'max:20'],
            'is_working' => ['sometimes', 'boolean'],
            'marriage_contract_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['approval_status'] = 'pending';

        if ($request->hasFile('marriage_contract_file')) {
            $file = $request->file('marriage_contract_file');
            $path = $file->store('spouses/contracts', 'public');
            $data['marriage_contract_path'] = $path;
        }

        $spouse->update($data);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث البيانات بنجاح، وهي قيد الانتظار للموافقة عليها من قبل الإدارة.',
            'data' => $spouse
        ]);
    }

    public function destroyForAuthenticatedEmployee(Request $request, $id): JsonResponse
    {
        $employee = $request->user()->employee;
        if (!$employee) {
            return response()->json(['success' => false, 'message' => 'Employee record not found'], 404);
        }

        $spouse = $employee->spouses()->find($id);
        if (!$spouse) {
            return response()->json(['success' => false, 'message' => 'Spouse record not found'], 404);
        }

        $spouse->delete();

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
