<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePayslipRequest;
use App\Jobs\ProcessPayslipPdf;
use App\Models\Payslip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PayslipController extends Controller
{
    public function index(): View
    {
        $years = Payslip::select('year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        if ($years->isEmpty()) {
            $years = collect([now()->year, now()->subYear()->year]);
        }

        $tableConfig = [
            'title' => 'قسائم الرواتب',
            'subtitle' => 'استعرض قسائم الرواتب وفلترتها حسب السنة والشهر.',
            'ajaxUrl' => route('payslips.data'),
            'type' => Payslip::TYPE_MASTER,
        ];

        return view('payslips.index', [
            'tableConfig' => $tableConfig,
            'years' => $years->unique()->values()->all(),
        ]);
    }

    public function individual(): View
    {
        $years = Payslip::select('year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        if ($years->isEmpty()) {
            $years = collect([now()->year, now()->subYear()->year]);
        }

        $tableConfig = [
            'title' => 'قسائم الرواتب لكل موظف',
            'subtitle' => 'ابحث عن أي موظف للاطلاع على القسائم الفردية الخاصة به.',
            'ajaxUrl' => route('payslips.data'),
            'type' => Payslip::TYPE_INDIVIDUAL,
        ];

        return view('payslips.individual', [
            'tableConfig' => $tableConfig,
            'years' => $years->unique()->values()->all(),
        ]);
    }

    public function data(Request $request): JsonResponse
    {
        $type = $request->input('filter_type', Payslip::TYPE_MASTER);
        $fullNameExpression = "TRIM(CONCAT_WS(' ', employees.first_name, employees.second_name, employees.third_name, employees.family_name))";

        $baseQuery = Payslip::query()
            ->select([
                'payslips.id',
                'payslips.year',
                'payslips.month',
                'payslips.file_path',
                'payslips.created_at',
                'payslips.type',
                'payslips.national_id',
                'payslips.page_number',
                'users.name as uploader_name',
                'employees.id as employee_id',
                'employees.employee_number',
                'employees.national_id as employee_national_id',
                DB::raw("{$fullNameExpression} AS employee_full_name"),
            ])
            ->leftJoin('users', 'users.id', '=', 'payslips.uploaded_by')
            ->leftJoin('employees', 'employees.id', '=', 'payslips.employee_id')
            ->where('payslips.type', $type);

        $recordsTotal = Payslip::where('type', $type)->count();

        if ($request->filled('filter_year')) {
            $baseQuery->where('payslips.year', (int) $request->input('filter_year'));
        }

        if ($request->filled('filter_month')) {
            $baseQuery->where('payslips.month', (int) $request->input('filter_month'));
        }

        $searchValue = $request->input('search.value');
        if (! empty($searchValue)) {
            $like = '%'.$searchValue.'%';
            $baseQuery->where(function ($query) use ($like, $fullNameExpression) {
                $query->where('users.name', 'like', $like)
                    ->orWhere('payslips.year', 'like', $like)
                    ->orWhere('payslips.month', 'like', $like)
                    ->orWhere('employees.employee_number', 'like', $like)
                    ->orWhere('employees.national_id', 'like', $like)
                    ->orWhereRaw("{$fullNameExpression} LIKE ?", [$like]);
            });
        }

        $recordsFiltered = (clone $baseQuery)->count();

        $orderColumnIndex = $request->input('order.0.column', 0);
        $orderDirection = $request->input('order.0.dir', 'desc');
        $orderableColumns = [
            'row_number',
            'year',
            'month',
            'uploader_name',
            'created_at',
            'employee_full_name',
            'employee_number',
        ];
        $orderColumn = $orderableColumns[$orderColumnIndex] ?? 'created_at';
        $columnMap = [
            'year' => 'payslips.year',
            'month' => 'payslips.month',
            'uploader_name' => 'users.name',
            'created_at' => 'payslips.created_at',
            'employee_full_name' => DB::raw("TRIM(CONCAT_WS(' ', employees.first_name, employees.second_name, employees.third_name, employees.family_name))"),
            'employee_number' => 'employees.employee_number',
        ];

        if ($orderColumn === 'row_number') {
            $baseQuery->orderBy('payslips.created_at', 'desc');
        } elseif ($orderColumn === 'employee_full_name') {
            $baseQuery->orderByRaw("{$fullNameExpression} {$orderDirection}");
        } else {
            $baseQuery->orderBy($columnMap[$orderColumn] ?? 'payslips.created_at', $orderDirection);
        }

        $length = (int) $request->input('length', 25);
        $start = (int) $request->input('start', 0);

        if ($length !== -1) {
            $baseQuery->skip($start)->take($length);
        }

        $monthNames = [
            1 => 'يناير', 2 => 'فبراير', 3 => 'مارس', 4 => 'أبريل',
            5 => 'مايو', 6 => 'يونيو', 7 => 'يوليو', 8 => 'أغسطس',
            9 => 'سبتمبر', 10 => 'أكتوبر', 11 => 'نوفمبر', 12 => 'ديسمبر',
        ];

        $payslips = $baseQuery->get();

        $data = $payslips->map(function ($payslip, $index) use ($start, $monthNames) {
            return [
                'row_number' => $start + $index + 1,
                'year' => $payslip->year,
                'month' => $monthNames[$payslip->month] ?? $payslip->month,
                'month_number' => $payslip->month,
                'uploader_name' => $payslip->uploader_name ?? 'غير محدد',
                'created_at' => $payslip->created_at?->format('Y-m-d H:i'),
                'employee_full_name' => $payslip->employee_full_name,
                'employee_number' => $payslip->employee_number,
                'employee_national_id' => $payslip->employee_national_id ?? $payslip->national_id,
                'actions' => view('payslips.partials.actions', ['payslip' => $payslip])->render(),
            ];
        });

        return response()->json([
            'draw' => (int) $request->input('draw'),
            'recordsTotal' => $recordsTotal,
            'recordsFiltered' => $recordsFiltered,
            'data' => $data,
        ]);
    }

    public function store(StorePayslipRequest $request): RedirectResponse
    {
        $year = (int) $request->input('year');
        $month = (int) $request->input('month');
        $file = $request->file('payslip_file');

        if (! $file || ! $file->isValid()) {
            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['payslip_file' => 'فشل في رفع الملف. يرجى المحاولة مرة أخرى.']);
        }

        $directory = "payslips/{$year}/{$month}";
        $sanitizedName = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        if ($sanitizedName === '') {
            $sanitizedName = 'payslip';
        }

        $extension = $file->getClientOriginalExtension();
        if (empty($extension)) {
            $extension = 'pdf';
        }

        $storedFileName = now()->format('YmdHis').'_'.$sanitizedName.'.'.$extension;
        $filePath = $file->storeAs($directory, $storedFileName, 'local');

        if (! $filePath) {
            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['payslip_file' => 'فشل في حفظ الملف. يرجى المحاولة مرة أخرى.']);
        }

        $storage = Storage::disk('local');

        $payslip = Payslip::firstOrNew([
            'year' => $year,
            'month' => $month,
            'type' => Payslip::TYPE_MASTER,
        ]);

        $previousPath = $payslip->file_path;

        $payslip->fill([
            'file_path' => $filePath,
            'uploaded_by' => $request->user()?->id,
        ]);

        $payslip->save();

        if ($previousPath && $previousPath !== $filePath && $storage->exists($previousPath)) {
            $storage->delete($previousPath);
        }

        ProcessPayslipPdf::dispatch($payslip);

        return redirect()
            ->route('payslips.index')
            ->with('success', 'تم رفع الملف وسيتم استخراج قسائم الموظفين خلال لحظات.');
    }

    public function download(Payslip $payslip): StreamedResponse
    {
        if (! Storage::disk('local')->exists($payslip->file_path)) {
            abort(404, 'الملف غير متوفر.');
        }

        if ($payslip->type === Payslip::TYPE_MASTER) {
            $fileName = "payslips-{$payslip->year}-{$payslip->month}.pdf";
        } else {
            $identifier = $payslip->national_id ?? $payslip->employee?->national_id ?? 'employee';
            $fileName = "payslip-{$identifier}-{$payslip->year}-{$payslip->month}.pdf";
        }

        return Storage::disk('local')->download($payslip->file_path, $fileName);
    }
}
