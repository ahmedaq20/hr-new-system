<?php

namespace App\Http\Controllers\Document;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeDocumentRequest;
use App\Http\Resources\EmployeeDocumentResource;
use App\Http\Resources\EmployeeDocumentsResource;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\ReferenceData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Modules\EmployeeDegree\Models\EmployeeDegree;

class EmployeeDocumentController extends Controller
{
    public function index(Request $request)
    {
        $routeName = request()->route()->getName();
        $isAcademic = strpos($routeName, 'academic') !== false;
        $statusFilter = $request->input('status');
        $searchTerm = $request->input('search');
        $start = (int) $request->input('start', 0);
        $length = (int) $request->input('length', 25);

        // --- 1. EmployeeDocument Query ---
        $docQuery = EmployeeDocument::query()
            ->with(['employee', 'documentType', 'referenceValue', 'reviewer'])
            ->whereHas('documentType', function ($q) {
                $q->where('name', 'EMPLOYEE_DOCUMENT');
            });

        if ($isAcademic) {
            $docQuery->whereNotNull('reference_value_id')
                ->whereHas('referenceValue', function ($q) {
                    $q->where('name', 'CERTIFICATE');
                });
        } else {
            $docQuery->whereNull('reference_value_id');
        }

        if ($request->filled('employee_id')) {
            $docQuery->where('employee_id', $request->input('employee_id'));
        }

        if ($request->filled('status')) {
            $docQuery->where('status', $statusFilter);
        } else {
            // Default to 'accepted' for documents
            $docQuery->where('status', 'accepted');
        }

        if ($searchTerm) {
            $docQuery->whereHas('employee', function ($q) use ($searchTerm) {
                $q->whereRaw("TRIM(CONCAT_WS(' ', first_name, second_name, third_name, family_name)) LIKE ?", ["%$searchTerm%"])
                  ->orWhere('national_id', 'like', "%$searchTerm%")
                  ->orWhere('employee_number', 'like', "%$searchTerm%");
            });
        }

        $documents = $docQuery->latest()->get();

        $mappedDocuments = $documents->map(function ($doc) {
            return [
                'id' => $doc->id,
                'employee_id' => $doc->employee_id,
                'employee_name' => $doc->employee ? trim("{$doc->employee->first_name} {$doc->employee->second_name} {$doc->employee->third_name} {$doc->employee->family_name}") : 'N/A',
                'document_type' => $doc->documentType?->value,
                'certificate_type' => $doc->referenceValue?->value,
                'status' => $doc->status,
                'notes' => $doc->notes,
                'file_url' => $doc->file_path ? url('api/v1/academic-documents/'.$doc->id.'/download') : null,
                'file_extension' => $doc->file_path ? pathinfo($doc->file_path, PATHINFO_EXTENSION) : 'pdf',
                'upload_date' => $doc->created_at?->format('Y-m-d'),
                'source' => 'document'
            ];
        });

        // --- 2. EmployeeDegree Query (Academic only) ---
        $mergedDocuments = $mappedDocuments;

        if ($isAcademic) {
            $degreeQuery = EmployeeDegree::query()
                ->with(['employee', 'qualification']);

            if ($request->filled('employee_id')) {
                $degreeQuery->where('employee_id', $request->input('employee_id'));
            }

            if ($request->filled('status')) {
                // Map frontend status to degree status
                $map = ['accepted' => 'approved', 'refused' => 'rejected', 'pending' => 'pending'];
                $degreeStatus = $map[$statusFilter] ?? $statusFilter;
                $degreeQuery->where('approval_status', $degreeStatus);
            } else {
                // Default to approved for degrees
                $degreeQuery->where('approval_status', 'approved');
            }

            if ($searchTerm) {
                $degreeQuery->whereHas('employee', function ($q) use ($searchTerm) {
                    $q->whereRaw("TRIM(CONCAT_WS(' ', first_name, second_name, third_name, family_name)) LIKE ?", ["%$searchTerm%"])
                      ->orWhere('national_id', 'like', "%$searchTerm%")
                      ->orWhere('employee_number', 'like', "%$searchTerm%");
                });
            }

            $degrees = $degreeQuery->latest()->get();
            $mappedDegrees = $degrees->map(function ($degree) {
                // Map back to frontend status
                $frontendStatus = 'pending';
                if ($degree->approval_status === 'approved') $frontendStatus = 'accepted';
                if ($degree->approval_status === 'rejected') $frontendStatus = 'refused';

                return [
                    'id' => 'degree_' . $degree->id,
                    'employee_id' => $degree->employee_id,
                    'employee_name' => $degree->employee ? trim("{$degree->employee->first_name} {$degree->employee->second_name} {$degree->employee->third_name} {$degree->employee->family_name}") : 'N/A',
                    'document_type' => 'الشهادات الأكاديمية',
                    'certificate_type' => $degree->qualification?->value,
                    'status' => $frontendStatus, 
                    'notes' => $degree->notes,
                    'file_url' => $degree->certificate_attachment ? asset('storage/' . $degree->certificate_attachment) : null,
                    'file_extension' => $degree->certificate_attachment ? pathinfo($degree->certificate_attachment, PATHINFO_EXTENSION) : 'pdf',
                    'upload_date' => $degree->created_at?->format('Y-m-d'),
                    'source' => 'degree',
                    'original_id' => $degree->id,
                    'major_name' => $degree->major_name,
                    'university_name' => $degree->university_name,
                    'graduation_year' => $degree->graduation_year,
                    'grade' => $degree->grade
                ];
            });

            $mergedDocuments = $mergedDocuments->concat($mappedDegrees);
        }

        $sortedDocuments = $mergedDocuments->sortByDesc('upload_date')->values();
        $totalCount = $sortedDocuments->count();
        $paginatedItems = $sortedDocuments->slice($start, $length)->values();
        
        return response()->json([
            'draw' => (int) $request->input('draw', 1),
            'recordsTotal' => $totalCount, 
            'recordsFiltered' => $totalCount,
            'data' => $paginatedItems,
            'meta' => [
                'current_page' => ($start / $length) + 1,
                'per_page' => $length,
                'total' => $totalCount,
                'last_page' => (int) ceil($totalCount / $length),
            ]
        ]);
    }

    public function create()
    {
        $routeName = request()->route()->getName();
        $isAcademic = str_contains($routeName, 'academic');
        $type = $isAcademic ? 'academic' : 'administrative';

        // Get the document type automatically based on type
        $documentType = ReferenceData::where('name', 'EMPLOYEE_DOCUMENT')
            ->where('value', $isAcademic ? 'الشهادات الأكاديمية' : 'مرفقات إدارية')
            ->first();

        if (! $documentType) {
            abort(500, 'نوع الوثيقة غير موجود في قاعدة البيانات. يرجى تشغيل الـ seeder أولاً.');
        }

        $certificates = ReferenceData::where('name', 'CERTIFICATE')->get();

        // Get reference value options based on document type
        // For academic: use CERTIFICATE
        // For administrative: can be extended in future with other reference_data types
        $referenceValueOptions = ReferenceData::where('name', 'CERTIFICATE')->get();

        // Load employees for Select2
        $employees = Employee::select('id', 'first_name', 'second_name', 'third_name', 'family_name')
            ->orderBy('first_name')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'text' => trim("{$employee->first_name} {$employee->second_name} {$employee->third_name} {$employee->family_name}"),
                ];
            });

        return view('employee-documents.create', [
            'documentType' => $documentType,
            'referenceValueOptions' => $referenceValueOptions,
            'employees' => $employees,
            'type' => $type,
            'isAcademic' => $isAcademic,
        ]);
    }

    public function store(StoreEmployeeDocumentRequest $request)
    {
        $routeName = request()->route()->getName();
        $isAcademic = str_contains($routeName, 'academic');
        $type = $isAcademic ? 'academic' : 'administrative';

        // Get document type automatically
        $documentType = ReferenceData::where('name', 'EMPLOYEE_DOCUMENT')
            ->where('value', $isAcademic ? 'الشهادات الأكاديمية' : 'مرفقات إدارية')
            ->first();

        if (! $documentType) {
            abort(500, 'نوع الوثيقة غير موجود في قاعدة البيانات. يرجى تشغيل الـ seeder أولاً.');
        }

        $file = $request->file('file');
        $employeeId = $request->input('employee_id');

        $directory = "employee-documents/{$employeeId}";
        $fileName = time().'_'.str()->slug($file->getClientOriginalName()).'.'.$file->getClientOriginalExtension();
        $filePath = $file->storeAs($directory, $fileName, 'local');

        $employeeDocument = EmployeeDocument::create([
            'employee_id' => $employeeId,
            'document_type_id' => $documentType->id,
            'reference_value_id' => $request->input('reference_value_id'),
            'file_path' => $filePath,
            'status' => 'pending',
            'notes' => $request->input('notes'),
        ]);

        $routeName = $type === 'academic' ? 'employee-documents.academic.index' : 'employee-documents.administrative.index';

//        ->with('success', 'تم رفع الوثيقة بنجاح')
        return (new EmployeeDocumentResource($employeeDocument))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function updateStatus(Request $request, EmployeeDocument $employeeDocument)
    {
        $document = $employeeDocument;
        $request->validate([
            'status' => ['required', 'in:pending,accepted,refused'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $document->update([
            'status' => $request->input('status'),
            'notes' => $request->input('notes'),
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
        ]);

        if ($request->wantsJson() || $request->ajax()) {
            return (new EmployeeDocumentsResource($document))
                ->response()
                ->setStatusCode(Response::HTTP_ACCEPTED);
        }

        return redirect()->back()
            ->with('success', 'تم تحديث حالة الوثيقة بنجاح');
    }

    public function destroy(Request $request, EmployeeDocument $employeeDocument)
    {
        $document = $employeeDocument;
        if (Storage::disk('local')->exists($document->file_path)) {
            Storage::disk('local')->delete($document->file_path);
        }

        $document->delete();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['message' => 'تم حذف الوثيقة بنجاح'], Response::HTTP_ACCEPTED);
        }

        return redirect()->back()
            ->with('success', 'تم حذف الوثيقة بنجاح');
    }

    public function download(EmployeeDocument $employeeDocument)
    {
        $document = $employeeDocument;
        if (! $document->file_path) {
            abort(404, 'مسار الملف غير موجود');
        }

        $filePath = $document->file_path;
        $fullPath = storage_path('app/'.$filePath);

        // Try file_exists first (more reliable)
        if (file_exists($fullPath)) {
            return response()->download($fullPath);
        }

        // Fallback to Storage
        if (Storage::disk('local')->exists($filePath)) {
            return response()->download(storage_path('app/' . $filePath));
        }

        abort(404, 'الملف غير موجود: '.$filePath);
    }
}
