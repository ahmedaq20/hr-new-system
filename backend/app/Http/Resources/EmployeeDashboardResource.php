<?php

namespace App\Http\Resources;

use App\Models\Payslip;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Modules\CoreModule\Support\PayslipNetSalaryExtractor;
use Smalot\PdfParser\Parser;
use Throwable;

class EmployeeDashboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     */
    public function toArray(Request $request): array
    {
        $employee = $this->resource;
        $user = $employee->user;
        $workDetail = $employee->workDetail;
        $latestPayslip = $employee->latestPayslip ?? null;
        $latestProfileUpdate = \App\Models\ProfileUpdateRequest::where('employee_id', $employee->id)
            ->latest()
            ->first();

        // Only show to employee if it's pending or rejected
        $pendingProfileUpdate = ($latestProfileUpdate && in_array($latestProfileUpdate->status, ['pending', 'rejected'])) 
            ? $latestProfileUpdate 
            : null;

        // Extract net salary from payslip if available
        $netSalary = null;
        if ($latestPayslip && $latestPayslip->file_path) {
            $netSalary = $this->extractNetSalary($latestPayslip);
        }

        // Generate payslip download link
        $payslipLink = $latestPayslip
            ? url('/api/v1/payslips/'.$latestPayslip->id.'/download')
            : null;

        return [
            'pending_profile_update' => $pendingProfileUpdate ? [
                'id' => $pendingProfileUpdate->id,
                'status' => $pendingProfileUpdate->status,
                'rejection_reason' => $pendingProfileUpdate->rejection_reason,
                'requested_changes' => $pendingProfileUpdate->requested_changes,
                'created_at' => $pendingProfileUpdate->created_at->format('Y-m-d H:i'),
            ] : null,
            'employment_status' => $workDetail?->employmentStatus?->value ?? null,

            'net_last_salary' => $netSalary,

            'last_payslip_link' => $payslipLink,

            'personal_info' => [
                'full_name' => $employee->full_name ?? $user->name,
                'first_name' => $employee->first_name,
                'family_name' => $employee->family_name,
                'employee_number' => $employee->employee_number,
                'national_id' => $employee->national_id,
                'department' => $workDetail?->workDepartment?->value ?? null,
                'job_title' => $workDetail?->jobTitle?->value ?? null,
                'phone' => $employee->primary_phone,
                'secondary_phone' => $employee->secondary_phone,
                'address' => $employee->address,
                'email' => $employee->email ?? $user->email,
                'photo_url' => $user->profile_photo_url,
                'marital_status' => $employee->marital_status ?? 'غير محدد',
                'gender' => $employee->gender ?? 'غير محدد',
                'governorate_id' => $employee->governorate_id,
                'governorate_name' => $employee->governorate?->name,
                'city_id' => $employee->city_id,
                'city_name' => $employee->city?->name,
                'birth_date' => $employee->birth_date ? $employee->birth_date->format('Y-m-d') : '---',
                'appointment_date' => $employee->date_of_appointment ? $employee->date_of_appointment->format('Y-m-d') : '---',
            ],

            /** @var array<int, array{full_name: string, status: string|null, national_id: string|null, is_working: bool, birth_date: string|null, marriage_contract_url: string|null}> */
            'spouses' => $employee->spouses->filter(fn($s) => $s->approval_status === 'approved')->map(function ($spouse) {
                return [
                    'id' => $spouse->id,
                    'full_name' => $spouse->full_name,
                    'status' => $spouse->approval_status ?? null,
                    'rejection_reason' => $spouse->rejection_reason,
                    'national_id' => $spouse->spouse_id_number ?? null,
                    'is_working' => $spouse->is_working ?? false,
                    'birth_date' => $spouse->birth_date ? $spouse->birth_date->format('Y-m-d') : null,
                    'marriage_contract_url' => $spouse->marriage_contract_path ? Storage::disk('public')->url($spouse->marriage_contract_path) : null,
                ];
            })->values(),

            /** @var array<int, array{full_name: string, age: int|null, study_status: string}> */
            'children' => $employee->children->filter(fn($c) => $c->approval_status === 'approved')->map(function ($child) {
                $studyStatus = null;
                if ($child->is_university_student) {
                    $studyStatus = 'طالب';
                } elseif ($child->is_working) {
                    $studyStatus = 'يعمل';
                } else {
                    $studyStatus = 'غير محدد';
                }

                return [
                    'id' => $child->id,
                    'full_name' => $child->full_name,
                    'status' => $child->approval_status,
                    'rejection_reason' => $child->rejection_reason,
                    'age' => $child->birth_date ? (function () use ($child) {
                        $birthDate = Carbon::parse($child->birth_date);
                        $now = Carbon::now();
                        $diff = $birthDate->diff($now);

                        if ($diff->y >= 1) {
                            return $diff->y . ' سنة';
                        } elseif ($diff->m >= 1) {
                            return $diff->m . ' شهر';
                        } else {
                            return $diff->d . ' يوم';
                        }
                    })() : null,
                    'study_status' => $studyStatus,
                    'is_working' => (bool) $child->is_working,
                    'is_university_student' => (bool) $child->is_university_student,
                    'id_card_image_url' => $child->id_card_image ? Storage::disk('public')->url($child->id_card_image) : null,
                    'birth_certificate_image_url' => $child->birth_certificate_image ? Storage::disk('public')->url($child->birth_certificate_image) : null,
                ];
            })->values(),

            /** @var array<int, array{full_name: string, relationship: string|null, dependency_reason: string|null, dependency_proof_url: string|null}> */
            'dependents' => $employee->dependents->filter(fn($d) => $d->approval_status === 'approved')->map(function ($dependent) {
                return [
                    'id' => $dependent->id,
                    'full_name' => $dependent->full_name,
                    'status' => $dependent->approval_status,
                    'rejection_reason' => $dependent->rejection_reason,
                    'relationship' => $dependent->relationship ?? null,
                    'dependency_reason' => $dependent->notes ?? null,
                    'dependency_proof_url' => $dependent->dependency_proof_path ? Storage::disk('public')->url($dependent->dependency_proof_path) : null,
                ];
            })->values(),

            /** @var array<int, array{degree: string|null, institution: string|null, graduation_year: int|null, status: string, certificate_url: string|null}> */
            'qualifications' => $employee->degrees->map(function ($degree) {
                return [
                    'id' => $degree->id,
                    'qualification_id' => $degree->qualification_id,
                    'degree' => $degree->qualification?->value ?? null,
                    'major_name' => $degree->major_name,
                    'institution' => $degree->university_name ?? null,
                    'graduation_year' => $degree->graduation_year ?? null,
                    'grade' => $degree->grade ?? null,
                    'notes' => $degree->notes ?? null,
                    'status' => $degree->approval_status ?? 'pending',
                    'rejection_reason' => $degree->rejection_reason,
                    'certificate_url' => $degree->certificate_attachment ? Storage::disk('public')->url($degree->certificate_attachment) : null,
                ];
            }),

            /** @var array<int, array{course_name: string|null, provider: string|null, date: string|null, status: string, certificate_url: string|null}> */
            'courses' => $employee->trainingParticipants->map(function ($participant) {
                return [
                    'id' => $participant->id,
                    'training_course_id' => $participant->training_course_id,
                    'notes' => $participant->notes,
                    'course_name' => $participant->training_course_id ? ($participant->trainingCourse?->course_name ?? null) : $participant->manual_course_name,
                    'provider' => $participant->training_course_id ? ($participant->trainingCourse?->training_provider ?? 'وزارة الاقتصاد الوطني') : $participant->manual_institution,
                    'date' => $participant->training_course_id ? ($participant->trainingCourse?->start_date ? $participant->trainingCourse->start_date->format('Y-m-d') : null) : $participant->course_date,
                    'hours' => $participant->course_hours,
                    'status' => $participant->approval_status ?? 'approved',
                    'rejection_reason' => $participant->rejection_reason,
                    'certificate_url' => $participant->certificate_path ? Storage::disk('public')->url($participant->certificate_path) : null,
                ];
            }),
        ];
    }

    /**
     * Extract net salary from payslip PDF.
     * Individual payslips are FPDI-generated single-page PDFs; Smalot returns empty
     * text from those. We therefore parse the parent (master) PDF when this payslip
     * is an individual, and take text from the page at page_number. For masters,
     * we parse the payslip's own file and use all pages.
     */
    private function extractNetSalary(Payslip $payslip): ?float
    {
        // For FPDI-generated individuals: parse the parent (master) file instead.
        $sourcePayslip = $payslip->parent_id ? $payslip->parent : $payslip;
        if (! $sourcePayslip || ! $sourcePayslip->file_path) {
            return null;
        }

        $storage = Storage::disk('local');
        if (! $storage->exists($sourcePayslip->file_path)) {
            return null;
        }

        $sourcePath = $storage->path($sourcePayslip->file_path);
        $pages = $this->getParsedPages($sourcePath, $payslip);
        if ($pages === null) {
            return null;
        }

        // Individual: use only the page that corresponds to this payslip.
        if ($payslip->parent_id) {
            $pageIndex = max(0, ($payslip->page_number ?? 1) - 1);
            $page = $pages[$pageIndex] ?? null;
            $text = $page ? $page->getText() : '';
        } else {
            $textParts = [];
            foreach ($pages as $page) {
                $textParts[] = $page->getText();
            }
            $text = implode("\n", $textParts);
        }

        return PayslipNetSalaryExtractor::extract($text);
    }

    /**
     * Parse the payslip PDF with Smalot and return page objects for text extraction.
     * Text is taken from the source PDF via getPages(); using $document->getText()
     * can yield empty or unreliable text for some PDFs (e.g. FPDI-generated).
     *
     * @return \Smalot\PdfParser\Page[]|null
     */
    private function getParsedPages(string $sourcePath, Payslip $payslip): ?array
    {
        try {
            $parser = new Parser;
            $document = $parser->parseFile($sourcePath);

            return $document->getPages();
        } catch (Throwable $exception) {
            Log::error('Smalot PDF parse failed for net salary extraction', [
                'payslip_id' => $payslip->id,
                'path' => $sourcePath,
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
    }
}
