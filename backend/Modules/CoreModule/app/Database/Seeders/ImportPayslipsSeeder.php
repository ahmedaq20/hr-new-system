<?php

namespace Modules\CoreModule\Database\Seeders;

use App\Jobs\ProcessPayslipPdf;
use App\Models\Payslip;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class ImportPayslipsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sourceDirectory = storage_path('app/private/seeders/payslips');
        $storage = Storage::disk('local');

        if (! File::exists($sourceDirectory)) {
            $this->command->warn("Source directory does not exist: {$sourceDirectory}");

            return;
        }

        $pdfFiles = File::glob($sourceDirectory.'/*.pdf');

        if (empty($pdfFiles)) {
            $this->command->warn('No PDF files found in the source directory.');

            return;
        }

        $this->command->info('Found '.count($pdfFiles).' PDF file(s) to import.');

        // Get the first admin user for uploaded_by, or create a system user
        $uploadedBy = User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->first();

        if (! $uploadedBy) {
            $this->command->warn('No admin user found. Payslips will be created without uploaded_by.');
        }

        $imported = 0;
        $skipped = 0;
        $errors = 0;

        foreach ($pdfFiles as $sourcePath) {
            $filename = basename($sourcePath);

            // Parse filename: format is MYYYY.pdf (e.g., 42025.pdf = month 4, year 2025)
            if (! preg_match('/^(\d{1,2})(\d{4})\.pdf$/i', $filename, $matches)) {
                $this->command->warn("Skipping file with invalid format: {$filename}");
                $skipped++;

                continue;
            }

            $month = (int) $matches[1];
            $year = (int) $matches[2];

            // Validate month
            if ($month < 1 || $month > 12) {
                $this->command->warn("Skipping file with invalid month ({$month}): {$filename}");
                $skipped++;

                continue;
            }

            // Validate year (reasonable range)
            if ($year < 2000 || $year > 2100) {
                $this->command->warn("Skipping file with invalid year ({$year}): {$filename}");
                $skipped++;

                continue;
            }

            try {
                // Check if payslip already exists
                $existingPayslip = Payslip::where('year', $year)
                    ->where('month', $month)
                    ->where('type', Payslip::TYPE_MASTER)
                    ->first();

                if ($existingPayslip) {
                    $this->command->info("Payslip for {$year}-{$month} already exists. Skipping...");
                    $skipped++;

                    continue;
                }

                // Create destination directory
                $destinationDirectory = "payslips/{$year}/{$month}";
                $destinationPath = "{$destinationDirectory}/{$filename}";

                // Ensure directory exists
                if (! $storage->exists($destinationDirectory)) {
                    $storage->makeDirectory($destinationDirectory);
                }

                // Copy file to destination
                $fileContents = File::get($sourcePath);
                $storage->put($destinationPath, $fileContents);

                // Create payslip record
                $payslip = Payslip::create([
                    'year' => $year,
                    'month' => $month,
                    'file_path' => $destinationPath,
                    'type' => Payslip::TYPE_MASTER,
                    'uploaded_by' => $uploadedBy?->id,
                ]);

                $this->command->info("Imported payslip: {$filename} ({$year}-{$month})");

                // Dispatch job to process the PDF and extract individual payslips
                ProcessPayslipPdf::dispatch($payslip);

                $imported++;
            } catch (\Exception $e) {
                $this->command->error("Error importing {$filename}: {$e->getMessage()}");
                $errors++;
            }
        }

        $this->command->info("\nImport Summary:");
        $this->command->info("  - Imported: {$imported}");
        $this->command->info("  - Skipped: {$skipped}");
        $this->command->info("  - Errors: {$errors}");

        if ($imported > 0) {
            $this->command->info("\nNote: Individual payslips are being processed in the background.");
        }
    }
}
