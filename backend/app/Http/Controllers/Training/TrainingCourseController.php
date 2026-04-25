<?php

namespace App\Http\Controllers\Training;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTrainingCourseRequest;
use App\Http\Requests\UpdateTrainingCourseRequest;
use App\Models\Employee;
use App\Models\ReferenceData;
use App\Models\TrainingCourse;
use App\Models\TrainingParticipant;
use App\Models\TrainingSupervisor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class TrainingCourseController extends Controller
{
    /**
     * List approved training participants for admin documents section.
     */
    public function adminParticipantsList(Request $request): JsonResponse
    {
        $searchTerm = $request->input('search');
        $start = (int) $request->input('start', 0);
        $length = (int) $request->input('length', 25);
        $statusFilter = $request->input('status');

        $query = TrainingParticipant::with(['trainingCourse.certificates', 'employee']);

        if ($statusFilter) {
            $map = ['accepted' => 'approved', 'refused' => 'rejected', 'pending' => 'pending'];
            $targetStatus = $map[$statusFilter] ?? $statusFilter;
            $query->where('approval_status', $targetStatus);
        } else {
            // Default to approved for admin list if no status specified
            $query->where('approval_status', 'approved');
        }

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->input('employee_id'));
        }

        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                // Search by Employee
                $q->whereHas('employee', function ($eq) use ($searchTerm) {
                    $eq->whereRaw("TRIM(CONCAT_WS(' ', first_name, second_name, third_name, family_name)) LIKE ?", ["%$searchTerm%"])
                      ->orWhere('national_id', 'like', "%$searchTerm%")
                      ->orWhere('employee_number', 'like', "%$searchTerm%");
                })
                // Or search by Course Name
                ->orWhereHas('trainingCourse', function ($cq) use ($searchTerm) {
                    $cq->where('name', 'like', "%$searchTerm%");
                })
                ->orWhere('manual_course_name', 'like', "%$searchTerm%");
            });
        }

        $totalRecords = (clone $query)->count();
        $participants = $query->latest()->skip($start)->take($length)->get();

        $formatted = $participants->map(function ($participant) {
            $courseName = $participant->trainingCourse?->name ?: $participant->manual_course_name;
            $institution = $participant->trainingCourse?->funding_entity ?: $participant->manual_institution;

            $courseHours = $participant->course_hours
                ?: $participant->trainingCourse?->duration;
            $courseDate = $participant->course_date
                ?: ($participant->trainingCourse?->start_date?->format('m/Y'));

            $certificateUrl = null;
            if ($participant->certificate_path) {
                $certificateUrl = asset('storage/' . $participant->certificate_path);
            } elseif ($participant->trainingCourse) {
                $cert = $participant->trainingCourse->certificates
                    ->where('employee_id', $participant->employee_id)
                    ->first();
                if ($cert) {
                    $certificateUrl = asset('storage/' . $cert->file_path);
                }
            }

            $displayStatus = 'pending';
            if ($participant->approval_status === 'approved') $displayStatus = 'accepted';
            if ($participant->approval_status === 'rejected') $displayStatus = 'refused';

            return [
                'id' => $participant->id,
                'employee_id' => $participant->employee_id,
                'employee_name' => $participant->employee?->full_name ?? '-',
                'course_name' => $courseName ?? '-',
                'institution' => $institution ?? '-',
                'course_hours' => $courseHours ?? '-',
                'course_date' => $courseDate ?? '-',
                'status' => $displayStatus,
                'notes' => $participant->notes,
                'certificate_url' => $certificateUrl,
                'source' => $participant->training_course_id ? 'predefined' : 'manual',
            ];
        });

        return response()->json([
            'draw' => (int) $request->input('draw', 1),
            'recordsTotal' => $totalRecords,
            'recordsFiltered' => $totalRecords,
            'data' => $formatted,
            'meta' => [
                'current_page' => ($start / $length) + 1,
                'per_page' => $length,
                'total' => $totalRecords,
                'last_page' => (int) ceil($totalRecords / $length),
            ]
        ]);
    }

    public function allParticipants(): JsonResponse
    {
        $participants = TrainingParticipant::with(['trainingCourse', 'employee'])->get();

        $formatted = $participants->map(function ($participant) {
            $courseName = $participant->trainingCourse?->name ?: $participant->manual_course_name;
            return [
                'id' => $participant->id,
                'employee_name' => $participant->employee?->full_name ?? '-',
                'national_id' => $participant->employee?->national_id ?? '-',
                'course_name' => $courseName,
                'manual_course_name' => $participant->manual_course_name,
                'manual_institution' => $participant->manual_institution,
                'course_hours' => $participant->course_hours,
                'course_date' => $participant->course_date,
                'notes' => $participant->notes,
                'certificate_path' => $participant->certificate_path,
                'approval_status' => $participant->approval_status,
                'course' => $participant->trainingCourse ? [
                    'name' => $participant->trainingCourse->name,
                    'provider' => $participant->trainingCourse->provider,
                    'start_date' => $participant->trainingCourse->start_date?->format('Y-m-d'),
                ] : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): View|JsonResponse
    {
        if ($request->wantsJson()) {
            return $this->data($request);
        }

        $trainingTypes = ReferenceData::where('name', 'TRAINING_TYPE')->get();
        $trainingClassifications = ReferenceData::where('name', 'TRAINING_CLASSIFICATION')->get();
        $departments = ReferenceData::where('name', 'DEPARTMENT')->get();

        $tableConfig = [
            'title' => 'إدارة الدورات التدريبية',
            'subtitle' => 'يمكنك استعراض وإدارة الدورات التدريبية وورش العمل والتدريب الميداني.',
            'ajaxUrl' => route('training-courses.data'),
            'show_add_button' => true,
            'add_button_label' => 'إضافة دورة جديدة',
            'table_id' => 'training-courses-table',
            'global_search_placeholder' => 'ابحث باسم الدورة، الفئة المستهدفة، أو الجهة الممولة...',
        ];

        $coursesCount = TrainingCourse::count();
        $participantsCount = TrainingParticipant::count();
        $supervisorsCount = TrainingSupervisor::count();

        return view('training.index', compact(
            'trainingTypes',
            'trainingClassifications',
            'departments',
            'tableConfig',
            'coursesCount',
            'participantsCount',
            'supervisorsCount'
        ));
    }

    /**
     * Get datatable data for courses.
     */
    public function data(Request $request): JsonResponse
    {
        $query = TrainingCourse::with(['trainingType', 'trainingClassification'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('target_audience', 'like', "%{$search}%")
                  ->orWhere('funding_entity', 'like', "%{$search}%");
            });
        }

        $courses = $query->paginate($request->get('per_page', 100)); // Large limit for SPA

         // Transform data to match frontend expectations
        $transformedData = collect($courses->items())->map(function ($course) {
            return [
                'id' => $course->id,
                'name' => $course->name,
                'training_type_id' => $course->training_type_id,
                'training_classification_id' => $course->training_classification_id,
                'target_audience' => $course->target_audience,
                'funding_entity' => $course->funding_entity,
                'duration' => $course->duration,
                'start_date' => $course->start_date ? $course->start_date->format('Y-m-d') : null,
                'end_date' => $course->end_date ? $course->end_date->format('Y-m-d') : null,
                'implementation_mechanism' => $course->implementation_mechanism,
                'location' => $course->location,
                'content' => $course->content,
                'other_details' => $course->other_details,
                'training_type' => [
                    'id' => optional($course->trainingType)->id,
                    'value' => optional($course->trainingType)->value,
                ],
                'training_classification' => [
                    'id' => optional($course->trainingClassification)->id,
                    'value' => optional($course->trainingClassification)->value,
                ]
            ];
        });

        return response()->json([
            'data' => $transformedData,
            'meta' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'total' => $courses->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTrainingCourseRequest $request): RedirectResponse|JsonResponse
    {
        $course = TrainingCourse::create($request->validated());

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'تم إضافة الدورة التدريبية بنجاح.',
                'data' => $course
            ]);
        }

        return redirect()
            ->route('training-courses.index')
            ->with('success', 'تم إضافة الدورة التدريبية بنجاح.');
    }

    /**
     * Display the specified resource.
     */
    public function show(TrainingCourse $training_course): JsonResponse
    {
        $training_course->refresh();
        $training_course->load([
            'trainingType',
            'trainingClassification',
            'participants.employee',
            'supervisors.employee',
            'attachments',
            'photos',
            'certificates.employee',
        ]);

        $sections = [
            'basic' => [
                'title' => 'البيانات الأساسية',
                'items' => [
                    $this->detailItem('اسم الدورة/الورشة', $training_course->name),
                    $this->detailItem('نوع الدورة/الورشة', $training_course->trainingType?->value),
                    $this->detailItem('تصنيف الدورة/الورشة', $training_course->trainingClassification?->value),
                    $this->detailItem('الفئة المستهدفة', $training_course->target_audience),
                    $this->detailItem('الجهة الممولة', $training_course->funding_entity),
                    $this->detailItem('مدة الدورة', $training_course->duration),
                ],
            ],
            'details' => [
                'title' => 'تفاصيل الدورة',
                'items' => [
                    $this->detailItem('آلية الانعقاد', $training_course->implementation_mechanism),
                    $this->detailItem('مكان الانعقاد', $training_course->location),
                    $this->detailItem('تاريخ البداية', $this->formatDate($training_course->start_date)),
                    $this->detailItem('تاريخ النهاية', $this->formatDate($training_course->end_date)),
                ],
            ],
            'content' => [
                'title' => 'المحتوى',
                'items' => [
                    $this->detailItem('محتوى الدورة', $training_course->content),
                    $this->detailItem('تفاصيل أخرى', $training_course->other_details),
                ],
            ],
        ];

        $participants = $training_course->participants->map(function ($participant) {
            return [
                'id' => $participant->id,
                'employee_id' => $participant->employee_id,
                'employee_name' => $participant->employee?->full_name ?? '-',
                'employee_number' => $participant->employee?->employee_number ?? '-',
                'notes' => $participant->notes ?? '-',
            ];
        });

        $supervisors = $training_course->supervisors->map(function ($supervisor) {
            return [
                'id' => $supervisor->id,
                'is_external' => $supervisor->is_external,
                'name' => $supervisor->name,
                'employee_id' => $supervisor->employee_id,
                'external_experience' => $supervisor->external_experience ?? '-',
                'external_contact_method' => $supervisor->external_contact_method ?? '-',
                'external_notes' => $supervisor->external_notes ?? '-',
                'notes' => $supervisor->notes ?? '-',
            ];
        });

        $badges = array_values(array_filter([
            $this->badgeItem('نوع الدورة', $training_course->trainingType?->value),
            $this->badgeItem('التصنيف', $training_course->trainingClassification?->value),
            $this->badgeItem('عدد المشاركين', (string) $training_course->participants->count()),
            $this->badgeItem('عدد المشرفين', (string) $training_course->supervisors->count()),
        ]));

        $attachments = collect();

        // General Attachments
        foreach ($training_course->attachments as $attachment) {
            $attachments->push([
                'id' => $attachment->id,
                'key' => "attach_{$attachment->id}",
                'type' => 'attachment',
                'name' => $attachment->file_name,
                'file_type' => $attachment->file_type,
                'size' => $this->formatSize($attachment->file_size),
                'description' => $attachment->description,
                'url' => asset('storage/' . $attachment->file_path),
            ]);
        }

        // Photos
        foreach ($training_course->photos as $photo) {
            $attachments->push([
                'id' => $photo->id,
                'key' => "photo_{$photo->id}",
                'type' => 'photo',
                'name' => $photo->caption ?? 'صورة للدورة',
                'file_type' => 'Image',
                'size' => '-',
                'description' => $photo->captured_at?->format('Y-m-d'),
                'url' => asset('storage/' . $photo->file_path),
            ]);
        }

        // Certificates
        foreach ($training_course->certificates as $cert) {
            $attachments->push([
                'id' => $cert->id,
                'key' => "cert_{$cert->id}",
                'type' => 'certificate',
                'name' => "شهادة: " . ($cert->employee?->full_name ?? '-'),
                'employee_number' => $cert->employee?->employee_number ?? '-',
                'file_type' => 'PDF',
                'size' => '-',
                'issue_date' => $cert->issued_at?->format('Y-m-d'),
                'notes' => $cert->notes,
                'url' => asset('storage/' . $cert->file_path),
            ]);
        }

        return response()->json([
            'course' => [
                'id' => $training_course->id,
                'name' => $training_course->name,
                'type' => $training_course->trainingType?->value,
                'classification' => $training_course->trainingClassification?->value,
                'target_audience' => $training_course->target_audience,
                'funding_entity' => $training_course->funding_entity,
                'duration' => $training_course->duration,
                'implementation_mechanism' => $training_course->implementation_mechanism,
                'location' => $training_course->location,
                'start_date' => $this->formatDate($training_course->start_date),
                'end_date' => $this->formatDate($training_course->end_date),
                'content' => $training_course->content,
                'other_details' => $training_course->other_details,
            ],
            'meta' => [
                'badges' => $badges,
            ],
            'sections' => $sections,
            'participants' => $participants,
            'supervisors' => $supervisors,
            'attachments' => $attachments,
        ]);
    }

    private function formatSize($bytes): string
    {
        if ($bytes === null) return '-';
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTrainingCourseRequest $request, TrainingCourse $training_course): RedirectResponse|JsonResponse
    {
        $training_course->update($request->validated());

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'تم تحديث بيانات الدورة التدريبية بنجاح.',
                'data' => $training_course
            ]);
        }

        return redirect()
            ->route('training-courses.index')
            ->with('success', 'تم تحديث بيانات الدورة التدريبية بنجاح.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TrainingCourse $training_course, Request $request): RedirectResponse|JsonResponse
    {
        $training_course->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'تم حذف الدورة التدريبية بنجاح.'
            ]);
        }

        return redirect()
            ->route('training-courses.index')
            ->with('success', 'تم حذف الدورة التدريبية بنجاح.');
    }

    /**
     * Add participants to a training course (supports multiple).
     */
    public function addParticipant(Request $request, TrainingCourse $training_course): JsonResponse
    {
        $request->validate([
            'employee_ids' => 'required|array|min:1',
            'employee_ids.*' => 'required|exists:employees,id',
        ]);

        $employeeIds = $request->employee_ids;
        $addedCount = 0;
        $skippedCount = 0;
        $addedParticipants = [];

        foreach ($employeeIds as $employeeId) {
            // Check if already participating
            $existing = TrainingParticipant::where('training_course_id', $training_course->id)
                ->where('employee_id', $employeeId)
                ->first();

            if ($existing) {
                $skippedCount++;

                continue;
            }

            $participant = TrainingParticipant::create([
                'training_course_id' => $training_course->id,
                'employee_id' => $employeeId,
                'approval_status' => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'submitted_by' => Auth::id(),
            ]);

            $participant->load('employee');
            $addedCount++;

            $addedParticipants[] = [
                'id' => $participant->id,
                'employee_id' => $participant->employee_id,
                'employee_name' => $participant->employee?->full_name ?? '-',
                'employee_number' => $participant->employee?->employee_number ?? '-',
            ];
        }

        if ($addedCount === 0 && $skippedCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'جميع الموظفين المختارين مشاركين بالفعل في هذه الدورة.',
            ], 422);
        }

        $message = "تم إضافة {$addedCount} مشارك بنجاح.";
        if ($skippedCount > 0) {
            $message .= " (تم تخطي {$skippedCount} لأنهم مشاركين بالفعل)";
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'added_count' => $addedCount,
            'skipped_count' => $skippedCount,
            'participants' => $addedParticipants,
        ]);
    }

    /**
     * Remove a participant from a training course.
     */
    public function removeParticipant(TrainingCourse $training_course, TrainingParticipant $participant): JsonResponse
    {
        if ($participant->training_course_id !== $training_course->id) {
            return response()->json([
                'success' => false,
                'message' => 'هذا المشارك غير مرتبط بهذه الدورة.',
            ], 422);
        }

        $participant->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم إزالة المشارك بنجاح.',
        ]);
    }

    /**
     * Add a supervisor to a training course.
     */
    public function addSupervisor(Request $request, TrainingCourse $training_course): JsonResponse
    {
        $request->validate([
            'is_external' => 'required|boolean',
            'employee_id' => 'required_if:is_external,false|nullable|exists:employees,id',
            'external_name' => 'required_if:is_external,true|nullable|string|max:255',
            'external_experience' => 'nullable|string|max:2000',
            'external_contact_method' => 'nullable|string|max:2000',
            'external_notes' => 'nullable|string|max:2000',
            'notes' => 'nullable|string|max:1000',
        ]);

        $supervisor = TrainingSupervisor::create([
            'training_course_id' => $training_course->id,
            'employee_id' => $request->is_external ? null : $request->employee_id,
            'is_external' => $request->is_external,
            'external_name' => $request->is_external ? $request->external_name : null,
            'external_experience' => $request->is_external ? $request->external_experience : null,
            'external_contact_method' => $request->is_external ? $request->external_contact_method : null,
            'external_notes' => $request->is_external ? $request->external_notes : null,
            'notes' => $request->notes,
        ]);

        $supervisor->load('employee');

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة المشرف بنجاح.',
            'supervisor' => [
                'id' => $supervisor->id,
                'is_external' => $supervisor->is_external,
                'name' => $supervisor->name,
                'employee_id' => $supervisor->employee_id,
                'external_experience' => $supervisor->external_experience ?? '-',
                'external_contact_method' => $supervisor->external_contact_method ?? '-',
                'external_notes' => $supervisor->external_notes ?? '-',
                'notes' => $supervisor->notes ?? '-',
            ],
        ]);
    }

    /**
     * Remove a supervisor from a training course.
     */
    public function removeSupervisor(TrainingCourse $training_course, TrainingSupervisor $supervisor): JsonResponse
    {
        if ($supervisor->training_course_id !== $training_course->id) {
            return response()->json([
                'success' => false,
                'message' => 'هذا المشرف غير مرتبط بهذه الدورة.',
            ], 422);
        }

        $supervisor->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم إزالة المشرف بنجاح.',
        ]);
    }

    /**
     * Get participants data for datatable.
     */
    public function participantsData(Request $request): JsonResponse
    {
        $courseId = $request->input('training_course_id');
        
        if (!$courseId) {
            return response()->json([
                'data' => [],
                'meta' => ['total' => 0]
            ]);
        }

        $query = TrainingParticipant::with('employee')
            ->where('training_course_id', $courseId)
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('employee', function ($q) use ($search) {
                $q->whereRaw("TRIM(CONCAT_WS(' ', first_name, second_name, third_name, family_name)) LIKE ?", ["%$search%"])
                  ->orWhere('employee_number', 'like', "%$search%");
            });
        }

        $participants = $query->paginate($request->get('per_page', 100));

        $transformedData = collect($participants->items())->map(function ($participant) {
            return [
                'id' => $participant->id,
                'employee_id' => $participant->employee_id,
                'employee_name' => $participant->employee?->full_name ?? '-',
                'employee_number' => $participant->employee?->employee_number ?? '-',
                'notes' => $participant->notes ?? '-',
            ];
        });

        return response()->json([
            'data' => $transformedData,
            'meta' => [
                'current_page' => $participants->currentPage(),
                'last_page' => $participants->lastPage(),
                'total' => $participants->total(),
            ]
        ]);
    }

    /**
     * Search employees for adding as participants.
     */
    public function searchEmployees(Request $request): JsonResponse
    {
        $search = $request->input('search', '');
        $excludeCourseId = $request->input('exclude_course_id');
        $onlyCourseId = $request->input('only_course_id');

        $query = Employee::query()
            ->select('id', 'first_name', 'second_name', 'third_name', 'family_name', 'employee_number', 'national_id');

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->whereRaw("TRIM(CONCAT_WS(' ', first_name, second_name, third_name, family_name)) LIKE ?", ["%$search%"])
                    ->orWhere('employee_number', 'like', "%$search%")
                    ->orWhere('national_id', 'like', "%$search%");
            });
        }

        if ($excludeCourseId) {
            $existingParticipantIds = TrainingParticipant::where('training_course_id', $excludeCourseId)
                ->pluck('employee_id');
            $query->whereNotIn('id', $existingParticipantIds);
        }

        if ($onlyCourseId) {
            $participantIds = TrainingParticipant::where('training_course_id', $onlyCourseId)
                ->pluck('employee_id');
            $query->whereIn('id', $participantIds);
        }

        $employees = $query->limit(20)->get();

        return response()->json([
            'results' => $employees->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'text' => $employee->full_name.' - '.$employee->employee_number,
                    'employee_number' => $employee->employee_number,
                    'national_id' => $employee->national_id,
                ];
            }),
        ]);
    }

    private function detailItem(string $label, ?string $value): array
    {
        return [
            'label' => $label,
            'value' => $value ?: '-',
        ];
    }

    private function badgeItem(string $label, ?string $value): ?array
    {
        if (empty($value)) {
            return null;
        }

        return [
            'label' => $label,
            'value' => $value,
        ];
    }

    private function formatDate($value): ?string
    {
        if (empty($value)) {
            return null;
        }

        $date = $value instanceof Carbon ? $value : Carbon::parse($value);

        return $date->format('Y-m-d');
    }

    /**
     * Approve a training participant.
     */
    public function approveParticipant(TrainingParticipant $participant): JsonResponse
    {
        $participant->update([
            'approval_status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم قبول طلب التسجيل في الدورة بنجاح.',
        ]);
    }

    /**
     * Reject a training participant.
     */
    public function rejectParticipant(Request $request, TrainingParticipant $participant): JsonResponse
    {
        $participant->update([
            'approval_status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم رفض طلب التسجيل في الدورة.',
        ]);
    }

    /**
     * Request registration for a training course (Employee side).
     */
    public function requestRegistration(Request $request, ?TrainingCourse $training_course = null): JsonResponse
    {
        $employeeId = $request->user()->employee->id ?? null;

        if (!$employeeId) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على سجل موظف مرتبط بحسابك.',
            ], 422);
        }

        // Validate based on manual or predefined
        if ($training_course && $training_course->exists) {
            // Check if already participating or requested
            $existing = TrainingParticipant::where('training_course_id', $training_course->id)
                ->where('employee_id', $employeeId)
                ->first();

            if ($existing) {
                $statusMsg = $existing->approval_status === 'pending' ? 'طلبك قيد المراجعة بالفعل.' : 'أنت مسجل بالفعل في هذه الدورة.';
                return response()->json([
                    'success' => false,
                    'message' => $statusMsg,
                ], 422);
            }
        }

        $data = [
            'training_course_id' => ($training_course && $training_course->exists) ? $training_course->id : null,
            'employee_id' => $employeeId,
            'approval_status' => 'pending',
            'submitted_by' => $request->user()->id,
            'notes' => $request->notes,
            'manual_course_name' => $request->manual_course_name,
            'manual_institution' => $request->manual_institution,
            'course_hours' => $request->course_hours,
            'course_date' => $request->course_date,
        ];

        if ($request->hasFile('certificate_attachment')) {
            $path = $request->file('certificate_attachment')->store('training_certificates', 'public');
            $data['certificate_path'] = $path;
        }

        $participant = TrainingParticipant::create($data);

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال طلب التسجيل بنجاح، بانتظار موافقة الإدارة.',
            'data' => $participant,
        ]);
    }
    /**
     * Update requested registration for a training course (Employee side).
     */
    public function updateRegistration(Request $request, TrainingParticipant $participant): JsonResponse
    {
        $user = $request->user();

        if (!$user->can('manage-profile-requests')) {
            if ($participant->employee_id !== ($user->employee->id ?? null)) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بتعديل هذا الطلب.',
                ], 403);
            }
        }

        $updateData = [
            'notes' => $request->notes,
            'manual_course_name' => $request->manual_course_name ?? $participant->manual_course_name,
            'manual_institution' => $request->manual_institution ?? $participant->manual_institution,
            'course_hours' => $request->course_hours ?? $participant->course_hours,
            'course_date' => $request->course_date ?? $participant->course_date,
            'approval_status' => Auth::user()->can('manage-profile-requests') ? 'approved' : 'pending',
        ];

        if (Auth::user()->can('manage-profile-requests')) {
            $updateData['approved_by'] = Auth::id();
            $updateData['approved_at'] = now();
        }

        if ($request->hasFile('certificate_attachment')) {
            // Delete old attachment if exists
            if ($participant->certificate_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($participant->certificate_path);
            }
            $path = $request->file('certificate_attachment')->store('training_certificates', 'public');
            $updateData['certificate_path'] = $path;
        }

        $participant->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث طلب التسجيل بنجاح، بانتظار المراجعة.',
            'data' => $participant,
        ]);
    }

    /**
     * Delete requested registration for a training course (Employee side).
     */
    public function deleteRegistration(Request $request, TrainingParticipant $participant): JsonResponse
    {
        $user = $request->user();

        if (!$user->can('manage-profile-requests')) {
            if ($participant->employee_id !== ($user->employee->id ?? null)) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بحذف هذا الطلب.',
                ], 403);
            }
        }

        $participant->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف طلب التسجيل بنجاح.',
        ]);
    }
}
