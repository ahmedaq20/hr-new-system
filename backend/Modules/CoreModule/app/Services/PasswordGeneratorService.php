<?php

namespace Modules\CoreModule\Services;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class PasswordGeneratorService
{
    /**
     * Whether to generate random passwords.
     * When false, uses static default password.
     */
    protected bool $useRandomPassword = false;

    /**
     * The default static password.
     */
    protected string $defaultPassword = 'password';

    /**
     * Path to the Excel file for storing passwords.
     */
    protected ?string $excelFilePath = null;

    /**
     * Generate a password for a new employee user.
     *
     * @return array{plain: string, hashed: string}
     */
    public function generate(): array
    {
        $plain = $this->useRandomPassword
            ? $this->generateRandomPassword()
            : $this->defaultPassword;

        return [
            'plain' => $plain,
            'hashed' => Hash::make($plain),
        ];
    }

    /**
     * Generate a random secure password.
     */
    protected function generateRandomPassword(int $length = 8): string
    {
        // Generate a password with numbers only for easy SMS communication
        return (string) random_int(10000000, 99999999);
    }

    /**
     * Enable random password generation.
     */
    public function useRandomPasswords(): self
    {
        $this->useRandomPassword = true;

        return $this;
    }

    /**
     * Use static default password.
     */
    public function useStaticPasswords(): self
    {
        $this->useRandomPassword = false;

        return $this;
    }

    /**
     * Check if random passwords are enabled.
     */
    public function isRandomPasswordEnabled(): bool
    {
        return $this->useRandomPassword;
    }

    /**
     * Set the default static password.
     */
    public function setDefaultPassword(string $password): self
    {
        $this->defaultPassword = $password;

        return $this;
    }

    /**
     * Send password via SMS and write to Excel file.
     *
     * @param  string  $phoneNumber  The phone number to send SMS to
     * @param  string  $password  The password to send
     * @param  string  $fullName  The employee's full name
     * @param  string  $nationalId  The employee's national ID
     */
    public function sendPasswordViaSms(string $phoneNumber, string $password, string $fullName, string $nationalId): bool
    {
        // Initialize Excel file path if not set
        if ($this->excelFilePath === null) {
            $this->excelFilePath = storage_path('app/employee_passwords_'.date('Y-m-d_His').'.xlsx');
        }

        try {
            $spreadsheet = null;
            $worksheet = null;

            // Try to load existing file, or create new one
            if (file_exists($this->excelFilePath)) {
                $spreadsheet = IOFactory::load($this->excelFilePath);
                $worksheet = $spreadsheet->getActiveSheet();
            } else {
                $spreadsheet = new Spreadsheet;
                $worksheet = $spreadsheet->getActiveSheet();

                // Set headers
                $worksheet->setCellValue('A1', 'الاسم الكامل');
                $worksheet->setCellValue('B1', 'رقم الهوية');
                $worksheet->setCellValue('C1', 'كلمة المرور');
                $worksheet->setCellValue('D1', 'رقم الجوال');

                // Style headers
                $worksheet->getStyle('A1:D1')->getFont()->setBold(true);
                $worksheet->getColumnDimension('A')->setWidth(30);
                $worksheet->getColumnDimension('B')->setWidth(15);
                $worksheet->getColumnDimension('C')->setWidth(15);
                $worksheet->getColumnDimension('D')->setWidth(15);
            }

            // Find next empty row
            $nextRow = $worksheet->getHighestRow() + 1;

            // Add data
            $worksheet->setCellValue('A'.$nextRow, $fullName);
            $worksheet->setCellValue('B'.$nextRow, $nationalId);
            $worksheet->setCellValue('C'.$nextRow, $password);
            $worksheet->setCellValue('D'.$nextRow, $phoneNumber ?: '-');

            // Save file
            $writer = new Xlsx($spreadsheet);
            $writer->save($this->excelFilePath);

            // TODO: Implement SMS provider integration
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to write password to Excel: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Get the Excel file path.
     */
    public function getExcelFilePath(): ?string
    {
        return $this->excelFilePath;
    }
}

