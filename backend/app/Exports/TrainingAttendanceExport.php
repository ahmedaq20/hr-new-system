<?php

namespace App\Exports;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Support\Collection;

class TrainingAttendanceExport
{
    protected $attendances;

    public function __construct(Collection $attendances)
    {
        $this->attendances = $attendances;
    }

    public function download($filename)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setRightToLeft(true);

        $headings = [
            'الرقم الوظيفي',
            'اسم الموظف',
            'التاريخ',
            'وقت الدخول',
            'وقت الخروج',
            'مكان العمل',
            'ملاحظات',
            'المصدر'
        ];

        $sheet->fromArray($headings, null, 'A1');

        $rowIndex = 2;
        foreach ($this->attendances as $attendance) {
            $data = [
                $attendance->employee?->employee_number ?? '-',
                $attendance->employee?->full_name ?? '-',
                optional($attendance->attendance_date)->format('Y-m-d'),
                $attendance->check_in_at ? substr($attendance->check_in_at, 0, 5) : '-',
                $attendance->check_out_at ? substr($attendance->check_out_at, 0, 5) : '-',
                $attendance->workplace ?? '-',
                $attendance->notes ?? '-',
                $attendance->source === 'manual' ? 'يدوي' : 'إستيراد'
            ];
            $sheet->fromArray($data, null, 'A' . $rowIndex);
            $rowIndex++;
        }

        $writer = new Xlsx($spreadsheet);
        
        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
