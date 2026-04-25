<?php

namespace App\Http\Controllers\Training;

use App\Exports\TrainingAttendanceExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\ImportTrainingAttendanceRequest;
use App\Http\Requests\StoreTrainingAttendanceRequest;
use App\Http\Requests\UpdateTrainingAttendanceRequest;
use App\Imports\TrainingAttendanceImport;
use App\Models\TrainingAttendance;
use App\Models\TrainingCourse;
use App\Services\TrainingAttendanceTableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class TrainingAttendanceController extends Controller
{
    public function index(): \Illuminate\Contracts\View\View
    {
        $courses = TrainingCourse::query()
            ->select('id', 'name', 'start_date')
            ->orderBy('name')
            ->get();

        return view('training.attendance', [
            'courses' => $courses,
            'coursesOptions' => $courses->map(function ($course) {
                $date = $course->start_date ? $course->start_date->format('Y-m-d') : null;

                return [
                    'id' => $course->id,
                    'text' => $date ? "{$course->name} ({$date})" : $course->name,
                ];
            }),
        ]);
    }

    public function data(Request $request, TrainingCourse $training_course, TrainingAttendanceTableService $tableService): JsonResponse
    {
        $payload = $tableService->handle($request, [
            'training_course_id' => $training_course->id,
            'actions_view' => $request->input('actions_view'),
        ]);

        return response()->json($payload);
    }

    public function store(StoreTrainingAttendanceRequest $request, TrainingCourse $training_course): JsonResponse
    {
        $validated = $request->validated();

        $attendance = TrainingAttendance::create([
            'training_course_id' => $training_course->id,
            'employee_id' => $validated['employee_id'],
            'attendance_date' => $validated['attendance_date'],
            'check_in_at' => $validated['check_in_at'] ?? null,
            'check_out_at' => $validated['check_out_at'] ?? null,
            'workplace' => $validated['workplace'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'source' => 'إدخال يدوي',
        ]);

        $attendance->load('employee');

        return response()->json([
            'success' => true,
            'attendance' => $this->formatAttendance($attendance),
        ]);
    }

    public function update(UpdateTrainingAttendanceRequest $request, TrainingCourse $training_course, TrainingAttendance $attendance): JsonResponse
    {
        if ($attendance->training_course_id !== $training_course->id) {
            abort(404);
        }

        $validated = $request->validated();

        $attendance->update([
            'employee_id' => $validated['employee_id'],
            'attendance_date' => $validated['attendance_date'],
            'check_in_at' => $validated['check_in_at'] ?? null,
            'check_out_at' => $validated['check_out_at'] ?? null,
            'workplace' => $validated['workplace'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'source' => 'إدخال يدوي',
        ]);

        $attendance->load('employee');

        return response()->json([
            'success' => true,
            'attendance' => $this->formatAttendance($attendance),
        ]);
    }

    public function template(TrainingCourse $training_course): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setRightToLeft(true);
        $sheet->fromArray([
            '#',
            'اسم الموظف',
            'رقم الموظف',
            'ساعة الحضور',
            'ساعة الانصراف',
            'مكان العمل',
            'ملاحظات',
        ], null, 'A1');

        $participants = $training_course->participants()->with('employee')->get();

        $rowIndex = 2;
        $serial = 1;
        foreach ($participants as $participant) {
            $fullName = trim(collect([
                $participant->employee?->first_name,
                $participant->employee?->second_name,
                $participant->employee?->third_name,
                $participant->employee?->family_name,
            ])->filter()->implode(' '));

            $sheet->fromArray([
                $serial,
                $fullName ?: '-',
                $participant->employee?->employee_number ?? '',
                '08:00', // default check in
                '15:00', // default check out
                '', // workplace
                '', // notes
            ], null, 'A'.$rowIndex);
            $rowIndex++;
            $serial++;
        }

        $lastDataRow = $rowIndex - 1;

        $range = "A1:G{$lastDataRow}";
        $sheet->getStyle($range)->applyFromArray([
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);

        foreach (range('A', 'G') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        // Freeze header for easy editing and add autofilter
        $sheet->freezePane('A2');
        $sheet->setAutoFilter('A1:G1');

        // Format time columns
        $sheet->getStyle("D2:E{$lastDataRow}")
            ->getNumberFormat()
            ->setFormatCode('hh:mm');

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'attendance-template.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function import(ImportTrainingAttendanceRequest $request, TrainingCourse $training_course): JsonResponse
    {
        $validated = $request->validated();
        $attendanceDate = $validated['attendance_date'];

        $importer = new TrainingAttendanceImport($training_course->id, $attendanceDate);
        $results = $importer->handle($validated['file']->getPathname());

        $count = count($results);
        $message = "تم استيراد الحضور بنجاح. عدد السجلات: {$count}.";

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }

    public function export(Request $request, TrainingCourse $training_course)
    {
        $attendanceDate = $request->input('attendance_date');
        $search = $request->input('search');
        $employeeId = $request->input('employee_id');

        $query = TrainingAttendance::query()
            ->with('employee')
            ->where('training_course_id', $training_course->id);

        if ($attendanceDate) {
            $query->whereDate('attendance_date', $attendanceDate);
        }

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        if ($search) {
            $like = '%'.$search.'%';
            $query->whereHas('employee', function ($q) use ($like) {
                $q->where(DB::raw("TRIM(CONCAT_WS(' ', first_name, second_name, third_name, family_name))"), 'like', $like)
                    ->orWhere('employee_number', 'like', $like);
            });
        }

        $rows = $query->orderBy('attendance_date', 'desc')->get();

        return (new TrainingAttendanceExport($rows))->download('attendance-export.xlsx');
    }

    private function formatAttendance(TrainingAttendance $attendance): array
    {
        return [
            'id' => $attendance->id,
            'employee_id' => $attendance->employee_id,
            'employee_name' => $attendance->employee?->full_name ?? '-',
            'employee_number' => $attendance->employee?->employee_number ?? '-',
            'attendance_date' => optional($attendance->attendance_date)->format('Y-m-d'),
            'check_in_at' => $attendance->check_in_at ? substr($attendance->check_in_at, 0, 5) : null,
            'check_out_at' => $attendance->check_out_at ? substr($attendance->check_out_at, 0, 5) : null,
            'workplace' => $attendance->workplace,
            'notes' => $attendance->notes,
            'source' => $attendance->source,
        ];
    }
}
