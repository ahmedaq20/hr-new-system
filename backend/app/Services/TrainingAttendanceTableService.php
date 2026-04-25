<?php

namespace App\Services;

use App\Models\TrainingAttendance;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class TrainingAttendanceTableService
{
    public function handle(Request $request, array $context = []): array
    {
        $trainingCourseId = $context['training_course_id'] ?? null;

        $query = TrainingAttendance::with('employee')
            ->where('training_course_id', $trainingCourseId);

        $totalRecords = (clone $query)->count();

        // Apply filters
        if ($request->filled('attendance_date')) {
            $query->whereDate('attendance_date', $request->input('attendance_date'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('employee', function ($eq) use ($search) {
                    $eq->where(function ($nem) use ($search) {
                        $nem->where('first_name', 'like', "%{$search}%")
                            ->orWhere('second_name', 'like', "%{$search}%")
                            ->orWhere('third_name', 'like', "%{$search}%")
                            ->orWhere('family_name', 'like', "%{$search}%")
                            ->orWhere('employee_number', 'like', "%{$search}%");
                    });
                });
            });
        }

        $recordsFiltered = (clone $query)->count();

        // Pagination
        $start = $request->input('start', 0);
        $length = $request->input('length', 10);
        
        if ($length != -1) {
            $query->skip($start)->take($length);
        }

        $attendances = $query->orderBy('attendance_date', 'desc')->get();

        $data = $attendances->map(function ($attendance, $index) use ($start) {
            return [
                'id' => $attendance->id,
                'row_number' => $start + $index + 1,
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
        });

        return [
            'draw' => (int) $request->input('draw'),
            'recordsTotal' => $totalRecords,
            'recordsFiltered' => $recordsFiltered,
            'data' => $data,
        ];
    }
}
