<?php

namespace App\Imports;

use App\Models\TrainingAttendance;
use App\Models\Employee;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TrainingAttendanceImport
{
    protected $trainingCourseId;
    protected $attendanceDate;

    public function __construct($trainingCourseId, $attendanceDate)
    {
        $this->trainingCourseId = $trainingCourseId;
        // Ensure date is in Y-m-d format for database queries
        $this->attendanceDate = $attendanceDate ? Carbon::parse($attendanceDate)->format('Y-m-d') : null;
    }

    public function handle($filePath)
    {
        return DB::transaction(function () use ($filePath) {
            try {
                $spreadsheet = IOFactory::load($filePath);
                $sheet = $spreadsheet->getActiveSheet();
                // toArray: null (no replace), true (calc formulas), true (format data), false (get all)
                $rows = $sheet->toArray(null, true, true, false);

                if (empty($rows)) {
                    Log::warning('TrainingAttendanceImport: No rows found in Excel.');
                    return [];
                }

                // First row is heading
                $headings = array_shift($rows);
                
                // Map headings to numeric indices
                $columnMap = $this->mapHeadings($headings);
                Log::info('TrainingAttendanceImport: Column Map', $columnMap);

                $results = [];
                $errors = [];
                
                foreach ($rows as $index => $row) {
                    $rowNumber = $index + 2;
                    // Check if row is empty
                    if (empty(array_filter($row))) {
                        continue;
                    }

                    $employeeNumber = trim($row[$columnMap['employee_number']] ?? '');
                    
                    if (!$employeeNumber || $employeeNumber === '-' || $employeeNumber === '') {
                        continue;
                    }

                    $employee = Employee::where('employee_number', $employeeNumber)->first();
                    
                    if (!$employee) {
                        $errors["row_{$rowNumber}"] = ["السطر {$rowNumber}: رقم الموظف ({$employeeNumber}) غير موجود في النظام."];
                        continue;
                    }

                    // Check if employee is registered in the course
                    $isParticipant = DB::table('training_participants')
                        ->where('training_course_id', $this->trainingCourseId)
                        ->where('employee_id', $employee->id)
                        ->exists();

                    if (!$isParticipant) {
                        $errors["row_{$rowNumber}"] = ["السطر {$rowNumber}: الموظف ({$employee->full_name}) غير مسجل في هذه الدورة."];
                        continue;
                    }

                    Log::info("TrainingAttendanceImport: Processing row {$rowNumber} for employee number: {$employeeNumber}");

                    // Determine record date: use Excel date if available and valid, otherwise use selected date
                    $recordDate = $this->attendanceDate;
                    if (isset($columnMap['date_found']) && $columnMap['date_found'] && !empty($row[$columnMap['date']])) {
                        try {
                            $excelDate = $row[$columnMap['date']];
                            if (is_numeric($excelDate)) {
                                $recordDate = Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($excelDate))->format('Y-m-d');
                            } else {
                                $recordDate = Carbon::parse($excelDate)->format('Y-m-d');
                            }
                        } catch (\Exception $e) {
                            Log::warning("TrainingAttendanceImport: Invalid date '{$row[$columnMap['date']]}' at row {$rowNumber}. Using default date: {$recordDate}");
                        }
                    }

                    if (!$recordDate) {
                        Log::warning("TrainingAttendanceImport: No date available for row {$rowNumber}");
                        continue;
                    }

                    // Robust upsert: first check manually using whereDate to handle different DB formats (e.g. SQLite with timestamps)
                    $attendance = TrainingAttendance::where('training_course_id', $this->trainingCourseId)
                        ->where('employee_id', $employee->id)
                        ->whereDate('attendance_date', $recordDate)
                        ->first();

                    $data = [
                        'training_course_id' => $this->trainingCourseId,
                        'employee_id' => $employee->id,
                        'attendance_date' => $recordDate,
                        'check_in_at' => $this->formatTime($row[$columnMap['check_in_at']] ?? '08:00'),
                        'check_out_at' => $this->formatTime($row[$columnMap['check_out_at']] ?? '15:00'),
                        'workplace' => $row[$columnMap['workplace']] ?? null,
                        'notes' => $row[$columnMap['notes']] ?? null,
                        'source' => 'استيراد',
                    ];

                    if ($attendance) {
                        $attendance->update($data);
                    } else {
                        $attendance = TrainingAttendance::create($data);
                    }

                    $results[] = $attendance;
                }

                if (!empty($errors)) {
                    throw \Illuminate\Validation\ValidationException::withMessages($errors);
                }

                Log::info("TrainingAttendanceImport: Successfully processed " . count($results) . " records.");
                return $results;
            } catch (\Illuminate\Validation\ValidationException $e) {
                // Re-throw validation exception to be handled by Laravel
                throw $e;
            } catch (\Exception $e) {
                Log::error('TrainingAttendanceImport Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
                throw $e;
            }
        });
    }

    private function mapHeadings($headings)
    {
        // Default indices based on the generated template in TrainingAttendanceController.php:
        // 0: serial (#)
        // 1: name (اسم الموظف)
        // 2: number (رقم الموظف)
        // 3: check_in (ساعة الحضور)
        // 4: check_out (ساعة الانصراف)
        // 5: workplace (مكان العمل)
        // 6: notes (ملاحظات)
        
        $map = [
            'employee_name' => 1,
            'employee_number' => 2,
            'check_in_at' => 3,
            'check_out_at' => 4,
            'workplace' => 5,
            'notes' => 6,
            'date' => 999, // placeholder, not in default template
            'date_found' => false
        ];

        // Search for specific headings to adjust mapping dynamically
        foreach ($headings as $index => $heading) {
            if (!$heading) continue;
            
            $heading = trim($heading);
            if (stripos($heading, 'رقم الموظف') !== false || stripos($heading, 'employee number') !== false) {
                $map['employee_number'] = $index;
            } elseif (stripos($heading, 'اسم الموظف') !== false || stripos($heading, 'employee name') !== false) {
                $map['employee_name'] = $index;
            } elseif (stripos($heading, 'ساعة الحضور') !== false || stripos($heading, 'check in') !== false) {
                $map['check_in_at'] = $index;
            } elseif (stripos($heading, 'ساعة الانصراف') !== false || stripos($heading, 'check out') !== false) {
                $map['check_out_at'] = $index;
            } elseif (stripos($heading, 'التاريخ') !== false || stripos($heading, 'date') !== false) {
                $map['date'] = $index;
                $map['date_found'] = true;
            } elseif (stripos($heading, 'مكان العمل') !== false || stripos($heading, 'workplace') !== false) {
                $map['workplace'] = $index;
            } elseif (stripos($heading, 'ملاحظات') !== false || stripos($heading, 'notes') !== false) {
                $map['notes'] = $index;
            }
        }

        return $map;
    }

    private function formatTime($time)
    {
        if (!$time) return null;
        
        // Handle numeric time from Excel (decimals represent portion of 24h)
        if (is_numeric($time)) {
             try {
                return Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($time))->format('H:i');
             } catch (\Exception $e) {
                 $hours = floor($time * 24);
                 $minutes = floor((($time * 24) - $hours) * 60);
                 return sprintf('%02d:%02d', $hours, $minutes);
             }
        }

        try {
            // Clean common time prefixes if any
            $time = trim($time);
            return Carbon::parse($time)->format('H:i');
        } catch (\Exception $e) {
            return null;
        }
    }
}
