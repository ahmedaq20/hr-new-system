<?php

namespace App\Jobs;

use App\Models\Employee;
use App\Models\Payslip;
use App\Support\NationalIdExtractor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use setasign\Fpdi\Fpdi;
use Smalot\PdfParser\Parser;
use Throwable;

class ProcessPayslipPdf implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(public Payslip $payslip) {}

    public function handle(): void
    {
        if ($this->payslip->type !== Payslip::TYPE_MASTER) {
            return;
        }

        $storage = Storage::disk('local');

        if (! $storage->exists($this->payslip->file_path)) {
            Log::warning('Payslip file missing for processing', ['payslip_id' => $this->payslip->id]);

            return;
        }

        $this->cleanupChildren();

        $sourcePath = $storage->path($this->payslip->file_path);

        $pageCount = $this->getPageCount($sourcePath);

        $pages = $this->getParsedPages($sourcePath);
        if ($pages === null) {
            Log::error('Unable to parse master payslip for text extraction', ['payslip_id' => $this->payslip->id]);

            return;
        }

        for ($page = 1; $page <= $pageCount; $page++) {
            $singlePagePath = $this->createSinglePagePdf($sourcePath, $page);

            if (! $singlePagePath) {
                continue;
            }

            $text = isset($pages[$page - 1]) ? $pages[$page - 1]->getText() : '';

            $nationalId = NationalIdExtractor::extract($text);

            if (! $nationalId) {
                Log::warning('Could not locate national ID in payslip page', [
                    'payslip_id' => $this->payslip->id,
                    'page' => $page,
                ]);
                $this->deleteTempFile($singlePagePath);

                continue;
            }

            $employee = Employee::where('national_id', $nationalId)->first();

            $relativePath = sprintf(
                'payslips/%s/%s/employees/%s-page-%s.pdf',
                $this->payslip->year,
                $this->payslip->month,
                $nationalId,
                $page
            );

            $contents = file_get_contents($singlePagePath);

            if ($contents === false) {
                Log::error('Unable to read generated payslip page', [
                    'payslip_id' => $this->payslip->id,
                    'page' => $page,
                ]);
                $this->deleteTempFile($singlePagePath);

                continue;
            }

            $storage->put($relativePath, $contents);
            $this->deleteTempFile($singlePagePath);

            Payslip::updateOrCreate(
                [
                    'type' => Payslip::TYPE_INDIVIDUAL,
                    'parent_id' => $this->payslip->id,
                    'page_number' => $page,
                ],
                [
                    'year' => $this->payslip->year,
                    'month' => $this->payslip->month,
                    'file_path' => $relativePath,
                    'uploaded_by' => $this->payslip->uploaded_by,
                    'employee_id' => $employee?->id,
                    'national_id' => $nationalId,
                ]
            );
        }
    }

    private function cleanupChildren(): void
    {
        $storage = Storage::disk('local');

        $this->payslip->children()->each(function (Payslip $child) use ($storage) {
            if ($storage->exists($child->file_path)) {
                $storage->delete($child->file_path);
            }

            $child->delete();
        });
    }

    private function getPageCount(string $sourcePath): int
    {
        $pdf = new Fpdi;

        return $pdf->setSourceFile($sourcePath);
    }

    /**
     * Parse the master PDF with Smalot and return page objects for text extraction.
     * Text must be taken from the source PDF; FPDI-generated single-page PDFs
     * embed pages as form XObjects and often yield empty text from Smalot.
     *
     * @return \Smalot\PdfParser\Page[]|null
     */
    private function getParsedPages(string $sourcePath): ?array
    {
        try {
            $parser = new Parser;
            $document = $parser->parseFile($sourcePath);

            return $document->getPages();
        } catch (Throwable $exception) {
            Log::error('Smalot PDF parse failed', [
                'payslip_id' => $this->payslip->id,
                'path' => $sourcePath,
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    private function createSinglePagePdf(string $sourcePath, int $pageNumber): ?string
    {
        try {
            $pdf = new Fpdi;
            $pdf->setSourceFile($sourcePath);
            $templateId = $pdf->importPage($pageNumber);
            $size = $pdf->getTemplateSize($templateId);
            $width = $size['width'] ?? 210;
            $height = $size['height'] ?? 297;
            $orientation = $width > $height ? 'L' : 'P';
            $pdf->AddPage($orientation, [$width, $height]);
            $pdf->useTemplate($templateId);

            $tmpDirectory = storage_path('app/tmp');
            if (! is_dir($tmpDirectory) && ! mkdir($tmpDirectory, 0775, true) && ! is_dir($tmpDirectory)) {
                return null;
            }

            $tempPath = $tmpDirectory.'/payslip_'.$this->payslip->id.'_'.Str::uuid().'.pdf';
            $pdf->Output($tempPath, 'F');

            return $tempPath;
        } catch (Throwable $exception) {
            Log::error('Unable to create single page PDF', [
                'payslip_id' => $this->payslip->id,
                'page' => $pageNumber,
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    private function deleteTempFile(string $path): void
    {
        if (file_exists($path)) {
            @unlink($path);
        }
    }
}
