<?php

namespace Modules\CoreModule\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Payslip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Modules\CoreModule\Support\PayslipNetSalaryExtractor;
use Smalot\PdfParser\Parser;
use Throwable;

class PayslipController extends Controller
{
    /**
     * List all payslips for the authenticated employee.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        $payslips = Payslip::where('employee_id', $employee->id)
            ->where('type', Payslip::TYPE_INDIVIDUAL)
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        $monthNames = [
            1 => 'يناير', 2 => 'فبراير', 3 => 'مارس', 4 => 'أبريل',
            5 => 'مايو', 6 => 'يونيو', 7 => 'يوليو', 8 => 'أغسطس',
            9 => 'سبتمبر', 10 => 'أكتوبر', 11 => 'نوفمبر', 12 => 'ديسمبر',
        ];

        $data = $payslips->map(function ($payslip) use ($monthNames) {
            return [
                'id' => $payslip->id,
                'year' => $payslip->year,
                'month' => $payslip->month,
                'month_name' => $monthNames[$payslip->month] ?? $payslip->month,
                'created_at' => $payslip->created_at?->format('Y-m-d'),
                'download_url' => url("/api/v1/employee/payslips/{$payslip->id}/download"),
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Display the employee's payslip for a specific period.
     */
    public function show(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        $year = $request->query('year', now()->year);
        $month = $request->query('month', now()->month);

        $payslip = Payslip::where('employee_id', $employee->id)
            ->where('year', $year)
            ->where('month', $month)
            ->with('parent')
            ->first();

        if (!$payslip) {
            return response()->json(['message' => 'Payslip not found for this period'], 404);
        }

        $netSalary = $this->extractNetSalary($payslip);

        $employee->load([
            'workDetail.workDepartment',
            'workDetail.jobTitle',
        ]);

        return response()->json([
            'data' => [
                'personal_info' => [
                    'full_name' => $user->name ?? $employee->full_name,
                    'employee_number' => $employee->employee_number,
                    'job_title' => $employee->workDetail?->jobTitle?->value ?? '---',
                    'department' => $employee->workDetail?->workDepartment?->value ?? '---',
                ],
                'financial_info' => [
                    'year' => (int) $year,
                    'month' => (int) $month,
                    'net_salary' => $netSalary,
                    // These are placeholders for now as the current extractor only gets net salary
                    'basic_salary' => null,
                    'allowances' => null,
                    'deductions' => null,
                ],
                'download_url' => url("/api/v1/employee/payslips/{$payslip->id}/download"),
            ]
        ]);
    }

    /**
     * Helper to extract net salary (replicated from EmployeeDashboardResource)
     */
    private function extractNetSalary(Payslip $payslip): ?float
    {
        $sourcePayslip = $payslip->parent_id ? $payslip->parent : $payslip;
        if (!$sourcePayslip || !$sourcePayslip->file_path) {
            return null;
        }

        $storage = Storage::disk('local');
        if (!$storage->exists($sourcePayslip->file_path)) {
            return null;
        }

        try {
            $sourcePath = $storage->path($sourcePayslip->file_path);
            $parser = new Parser();
            $document = $parser->parseFile($sourcePath);
            $pages = $document->getPages();

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
        } catch (Throwable $e) {
            return null;
        }
    }

    /**
     * Download the payslip with ownership check.
     */
    public function download(Request $request, $id)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['message' => 'Employee record not found'], 404);
        }

        $payslip = Payslip::where('id', $id)
            ->where('employee_id', $employee->id)
            ->firstOrFail();

        if (!Storage::disk('local')->exists($payslip->file_path)) {
            return response()->json(['message' => 'File not found on server'], 404);
        }

        $identifier = $employee->employee_number ?? $employee->national_id ?? 'employee';
        $fileName = "payslip-{$identifier}-{$payslip->year}-{$payslip->month}.pdf";

        return Storage::disk('local')->download($payslip->file_path, $fileName);
    }
}
