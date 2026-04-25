<?php

namespace Modules\CoreModule\Database\Seeders;

use App\Models\Employee;
use App\Models\ReferenceData;
use App\Models\WorkDetail;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportEmployeesFromExcelSeeder extends Seeder
{
    /**
     * Reference to the reference data cache for dynamic updates.
     */
    private array $referenceDataCache = [];

    private string $contractReferenceName = 'CONTRACT';

    private string $defaultContractValue = 'عقد غير معلوم';

    /**
     * Known contract labels that should be treated as contract employees.
     *
     * @var array<int, string>
     */
    private array $contractLabels = ['عقد دائم', 'عقد متوقف'];

    /**
     * Column mapping from Excel headers to database fields
     * Supports multiple possible column names (Arabic and English variations).
     */
    private array $columnMapping = [
        // Employee fields
        'full_name' => ['full_name', 'الاسم الكامل', 'name', 'اسم', 'الاسم', 'fullname', 'الاسم_الكامل', 'اسم الموظف'],
        'birth_date' => ['birth_date', 'تاريخ الميلاد', 'date_of_birth', 'تاريخ_الميلاد'],
        'national_id' => ['national_id', 'رقم الهوية', 'الهوية الوطنية', 'id', 'رقم_الهوية'],
        'employee_number' => ['employee_number', 'رقم الموظف', 'الرقم الوظيفي', 'employee_no', 'رقم_الموظف'],
        'first_name' => ['first_name', 'الاسم الأول', 'firstname', 'الاسم_الأول'],
        'second_name' => ['second_name', 'الاسم الثاني', 'secondname', 'الاسم_الثاني', 'اسم الأب', 'اسم_الأب'],
        'third_name' => ['third_name', 'الاسم الثالث', 'thirdname', 'الاسم_الثالث', 'اسم الجد', 'اسم_الجد'],
        'family_name' => ['family_name', 'اسم العائلة', 'last_name', 'surname', 'اسم_العائلة', 'الاسم الرابع', 'الاسم_الرابع'],
        'gender' => ['gender', 'الجنس', 'sex'],
        'primary_phone' => ['primary_phone', 'الهاتف الأساسي', 'phone', 'mobile', 'الهاتف_الأساسي', 'رقم الجوال/ الهاتف'],
        'date_of_appointment' => ['date_of_appointment', 'تاريخ التعيين'],
        'address' => ['address', 'العنوان', 'الإقامة الفعلية قبل النزوح'],
        'bank_id' => ['bank_id', 'البنك', 'bank', 'البنك'],
        'bank_account_number' => ['bank_account_number', 'رقم الحساب', 'account_number', 'رقم_الحساب'],
        'bank_iban' => ['bank_iban', 'رقم الايبان', 'iban', 'iban_number', 'رقم_الايبان', 'رقم الايبان'],
        'displacement_location' => ['مكان النزوح'],

        // Work details fields
        'ministry_id' => ['ministry', 'الوزارة', 'ministry_id'],
        'management_department_id' => ['الإدارة', 'الادارة', 'management_department', 'الإدارة العامة', 'management_dept', 'الإدارة_العامة'],
        'work_department_id' => ['work_department', 'الدائرة', 'department', 'الدائرة'],
        'section_id' => ['section', 'القسم', 'section_id', 'قسم'],
        'division_id' => ['division', 'الشعبة', 'division_id'],
        'unit_id' => ['unit', 'الوحدة', 'unit_id', 'الوحـــــــدة'],
        'crossing_id' => ['crossing', 'المعبر', 'crossing_id'],
        'sub_office_id' => ['sub_office', 'المكتب الفرعي', 'sub_office_id', 'المكتب_الفرعي', 'المكاتب الفرعية', 'المكاتب الفرعية ', 'workplace', 'مكان العمل', 'workplace_id', 'مكان_العمل'],
        'job_title_id' => ['job_title', 'المسمى الوظيفي', 'job_title_id', 'المسمى_الوظيفي'],
        'employment_status_id' => ['employment_status', 'حالة التوظيف', 'status', 'حالة_التوظيف', 'حالة الموظف'],
        'program_id' => ['program', 'البرنامج', 'program_id'],
        'classification_id' => ['classification', 'التصنيف', 'classification_id'],
        'category_id' => ['category', 'الفئة', 'category_id'],
        'job_scale_id' => ['job_scale', 'السلم الوظيفي', 'scale', 'السلم_الوظيفي'],
        'degree_id' => ['degree', 'الدرجة', 'grade_level', 'الدرجة الوظيفية', 'grade'],
        'seniority' => ['seniority', 'الأقدمية', 'seniority_level', 'الأقدمية'],
        'certificate_id' => ['certificate', 'الشهادة', 'qualification', 'الشهادة'],
        'actual_service' => ['actual_service', 'خدمة فعلية', 'service', 'خدمة_فعلية'],
        'promotion' => ['promotion', 'ترقية', 'promotion_date', 'الترقية'],
        'salary_purposes' => ['salary_purposes', 'لأغراض الراتب', 'salary', 'لأغراض_الراتب', 'لجنة تقاعد لأغراض الراتب'],
        'fragmentation' => ['fragmentation', 'التجزئة', 'frag', 'التجزئة'],
        'is_supervisory' => ['is_supervisory', 'إشرافي', 'supervisory', 'عمل_إشرافي', 'هل يقوم الموظف حاليا بعمل اشرافي', 'هل يقوم الموظف بعمل اشرافي'],
        'children_count' => ['عدد الأولاد'],
        'spouses_count' => ['عدد الأزواج/الزوجات', 'عدد الزوجات', 'عدد الأزواج'],
        'notes' => ['notes', 'ملاحظات', 'note', 'comments', 'الملاحظات'],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $filePath = storage_path('app/private/seeders/employees.xlsx');

        if (! file_exists($filePath)) {
            $this->command->error("File not found: {$filePath}");

            return;
        }

        $this->command->info("Loading Excel file: {$filePath}");
        $this->command->info('File size: '.number_format(filesize($filePath) / 1024 / 1024, 2).' MB');

        try {
            $this->command->info('Reading Excel file...');
            $spreadsheet = IOFactory::load($filePath);
            $sheetNames = $spreadsheet->getSheetNames();
            $this->command->info('Excel file loaded successfully.');
        } catch (\Exception $e) {
            $this->command->error("Error loading Excel file: {$e->getMessage()}");
            $this->command->error("Stack trace: {$e->getTraceAsString()}");

            return;
        }

        $this->command->info('Found '.count($sheetNames).' sheets in Excel file: '.implode(', ', $sheetNames));

        // Get all reference data for quick lookup
        $referenceDataCache = $this->loadReferenceDataCache();
        $this->referenceDataCache = &$referenceDataCache; // Store reference for updates

        // Get ministry ID for "وزارة الاقتصاد الوطني"
        $ministryId = ReferenceData::where('name', 'MINISTRY')
            ->where('value', 'وزارة الاقتصاد الوطني')
            ->value('id');

        if (! $ministryId) {
            // Create it if it doesn't exist
            $ministry = ReferenceData::create([
                'name' => 'MINISTRY',
                'value' => 'وزارة الاقتصاد الوطني',
            ]);
            $ministryId = $ministry->id;
            $this->command->info('Created ministry: وزارة الاقتصاد الوطني');
        }

        // Get all employment types from reference_data
        $employmentTypes = ReferenceData::where('name', 'EMPLOYMENT_TYPE')
            ->pluck('id', 'value')
            ->toArray();

        // Ensure default employment status exists
        $defaultEmploymentStatusId = ReferenceData::firstOrCreate(
            [
                'name' => 'EMPLOYMENT_STATUS',
                'value' => 'على رأس عمله - داخل الوطن',
            ]
        )->id;

        // Get default job scale "قانون الخدمة المدنية العامة المعدل - سلم الرواتب"
        $defaultJobScaleId = ReferenceData::firstOrCreate(
            [
                'name' => 'JOB_SCALE',
                'value' => 'قانون الخدمة المدنية العامة المعدل - سلم الرواتب',
            ]
        )->id;

        // Get program IDs for default and contract employees
        $defaultProgramId = ReferenceData::where('name', 'PROGRAM')
            ->where('value', 'موظفين غير موزعين على برنامج')
            ->value('id');

        $contractProgramId = ReferenceData::where('name', 'PROGRAM')
            ->where('value', 'موظفين عقود على بند التشغيل الطارئ')
            ->value('id');

        foreach ($sheetNames as $sheetName) {
            $this->command->info("Processing sheet: {$sheetName}");

            // Find the employment type ID for this sheet name
            $employmentTypeId = $employmentTypes[$sheetName] ?? null;

            if (! $employmentTypeId) {
                $this->command->warn("Employment type '{$sheetName}' not found in reference_data. Skipping...");

                continue;
            }

            $sheet = $spreadsheet->getSheetByName($sheetName);
            $this->command->info("Converting sheet '{$sheetName}' to array (this may take a moment for large files)...");
            $data = $sheet->toArray();
            $this->command->info('Sheet converted. Processing '.count($data).' rows...');

            // Get header row
            $headerRow = array_shift($data);
            $headerMap = $this->mapHeaders($headerRow);

            $this->command->info('Found '.count($data)." rows in sheet '{$sheetName}'");

            $imported = 0;
            $created = 0;
            $skipped = 0;
            $totalRows = count($data);
            $progressInterval = max(1, (int) ($totalRows / 10)); // Log every 10% or at least every row

            foreach ($data as $rowIndex => $row) {
                // Show progress every N rows
                if ($rowIndex % $progressInterval === 0 || $rowIndex === $totalRows - 1) {
                    $progress = round((($rowIndex + 1) / $totalRows) * 100, 1);
                    $this->command->info('Processing row '.($rowIndex + 2).' of '.($totalRows + 1)." ({$progress}%) - Imported: {$imported}, Created: {$created}, Skipped: {$skipped}");
                }
                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }

                try {
                    $rowData = $this->mapRowData($row, $headerMap);
                    $rowData = $this->applyContractMetadata($rowData);

                    // Get identifier (national_id or employee_number)
                    $identifier = $rowData['national_id'] ?? $rowData['employee_number'] ?? null;

                    if (! $identifier) {
                        $this->command->warn('Row '.($rowIndex + 2).': No identifier found (national_id or employee_number)');
                        $skipped++;

                        continue;
                    }

                    // Try to find or create employee
                    $employee = Employee::where('national_id', $identifier)
                        ->orWhere('employee_number', $identifier)
                        ->first();

                    if (! $employee) {
                        try {
                            // Create new employee
                            $employeeData = $this->extractEmployeeData($rowData);
                            $employee = Employee::create($employeeData);
                            $created++;
                        } catch (\Illuminate\Database\QueryException $e) {
                            // Handle duplicate entry silently
                            if ($this->isDuplicateEntryError($e)) {
                                // Try to find the employee again (might have been created by another process)
                                $employee = Employee::where('national_id', $identifier)
                                    ->orWhere('employee_number', $identifier)
                                    ->first();

                                if (! $employee) {
                                    $skipped++;

                                    continue;
                                }
                            } else {
                                // Re-throw if it's not a duplicate entry error
                                throw $e;
                            }
                        }
                    }

                    // Get or create work detail
                    try {
                        $workDetailData = $this->extractWorkDetailData($rowData, $referenceDataCache);
                        $workDetailData['employment_type_id'] = $employmentTypeId;

                        // Set default job scale if not already set
                        if (! isset($workDetailData['job_scale_id']) || empty($workDetailData['job_scale_id'])) {
                            $workDetailData['job_scale_id'] = $defaultJobScaleId;
                        }

                        // Default employment status if missing
                        if (! isset($workDetailData['employment_status_id']) || empty($workDetailData['employment_status_id'])) {
                            $workDetailData['employment_status_id'] = $defaultEmploymentStatusId;
                        }

                        // Set program based on contract value if not already set from Excel
                        if (! isset($workDetailData['program_id']) || empty($workDetailData['program_id'])) {
                            $contractValue = $rowData['contract_value'] ?? null;

                            if ($contractProgramId && $this->isContractEmployee($contractValue)) {
                                $workDetailData['program_id'] = $contractProgramId;
                            } elseif ($defaultProgramId) {
                                $workDetailData['program_id'] = $defaultProgramId;
                            }
                        }

                        // Set default employment status to "على رأس عمله" if not already set
                        if (! isset($workDetailData['employment_status_id']) || empty($workDetailData['employment_status_id'])) {
                            $workDetailData['employment_status_id'] = $this->getDefaultEmploymentStatusId($referenceDataCache);
                        }

                        // Set ministry_id to "وزارة الاقتصاد الوطني" if not already set
                        if (! isset($workDetailData['ministry_id']) || empty($workDetailData['ministry_id'])) {
                            $workDetailData['ministry_id'] = $ministryId;
                        }

                        WorkDetail::updateOrCreate(
                            ['employee_id' => $employee->id],
                            $workDetailData
                        );

                        $imported++;
                    } catch (\Illuminate\Database\QueryException $e) {
                        // Handle duplicate entry silently for work_details
                        if ($this->isDuplicateEntryError($e)) {
                            // Work detail already exists, just update it
                            $workDetailData = $this->extractWorkDetailData($rowData, $referenceDataCache);
                            $workDetailData['employment_type_id'] = $employmentTypeId;

                            // Set default job scale if not already set
                            if (! isset($workDetailData['job_scale_id']) || empty($workDetailData['job_scale_id'])) {
                                $workDetailData['job_scale_id'] = $defaultJobScaleId;
                            }

                            // Default employment status if missing
                            if (! isset($workDetailData['employment_status_id']) || empty($workDetailData['employment_status_id'])) {
                                $workDetailData['employment_status_id'] = $defaultEmploymentStatusId;
                            }

                            // Set program based on contract value if not already set from Excel
                            if (! isset($workDetailData['program_id']) || empty($workDetailData['program_id'])) {
                                $contractValue = $rowData['contract_value'] ?? null;

                                if ($contractProgramId && $this->isContractEmployee($contractValue)) {
                                    $workDetailData['program_id'] = $contractProgramId;
                                } elseif ($defaultProgramId) {
                                    $workDetailData['program_id'] = $defaultProgramId;
                                }
                            }

                            // Set default employment status to "على رأس عمله" if not already set
                            if (! isset($workDetailData['employment_status_id']) || empty($workDetailData['employment_status_id'])) {
                                $workDetailData['employment_status_id'] = $this->getDefaultEmploymentStatusId($referenceDataCache);
                            }

                            // Set ministry_id to "وزارة الاقتصاد الوطني" if not already set
                            if (! isset($workDetailData['ministry_id']) || empty($workDetailData['ministry_id'])) {
                                $workDetailData['ministry_id'] = $ministryId;
                            }

                            WorkDetail::where('employee_id', $employee->id)
                                ->update($workDetailData);

                            $imported++;
                        } else {
                            // Re-throw if it's not a duplicate entry error
                            throw $e;
                        }
                    }
                } catch (\Exception $e) {
                    if (! $this->isDuplicateEntryError($e)) {
                        $this->command->error('Error processing row '.($rowIndex + 2).": {$e->getMessage()}");
                    }
                    $skipped++;
                }
            }

            $this->command->info("Sheet '{$sheetName}': Imported {$imported}, Created {$created}, Skipped {$skipped}");
        }

        $this->command->info('Import completed!');

        // Update statuses using the companion file if available
        $this->updateEmploymentStatuses(
            $referenceDataCache,
            $defaultJobScaleId,
            $defaultProgramId,
            $contractProgramId,
            $ministryId
        );

        // Run retirement check after import
        $this->command->info('Checking retirement status...');
        Artisan::call('employees:check-retirement');
        $this->command->info('Retirement status check completed!');
    }

    private function updateEmploymentStatuses(
        array &$referenceDataCache,
        int $defaultJobScaleId,
        ?int $defaultProgramId,
        ?int $contractProgramId,
        int $defaultMinistryId
    ): void {
        $statusFilePath = storage_path('app/private/seeders/employees-status.xlsx');

        if (! file_exists($statusFilePath)) {
            $this->command->warn('Status file employees-status.xlsx not found. Skipping status update.');

            return;
        }

        $spreadsheet = IOFactory::load($statusFilePath);
        $sheetNames = $spreadsheet->getSheetNames();

        $defaultEmploymentTypeId = ReferenceData::firstOrCreate(
            [
                'name' => 'EMPLOYMENT_TYPE',
                'value' => 'رسمي',
            ]
        )->id;

        $totalUpdated = 0;
        $totalCreated = 0;
        $totalSkipped = 0;

        foreach ($sheetNames as $sheetName) {
            $this->command->info("Updating statuses from sheet: {$sheetName}");

            $statusId = $this->findReferenceDataId($sheetName, 'EMPLOYMENT_STATUS', $referenceDataCache);

            if (! $statusId) {
                $this->command->warn("Status '{$sheetName}' could not be resolved. Skipping sheet...");

                continue;
            }

            $sheet = $spreadsheet->getSheetByName($sheetName);
            if (! $sheet) {
                $this->command->warn("Sheet '{$sheetName}' not found. Skipping...");

                continue;
            }

            $data = $sheet->toArray();
            $headerRow = array_shift($data);
            $headerMap = $this->mapHeaders($headerRow);

            foreach ($data as $rowIndex => $row) {
                if (empty(array_filter($row))) {
                    continue;
                }

                try {
                    $rowData = $this->mapRowData($row, $headerMap);
                    $rowData = $this->applyContractMetadata($rowData);

                    $identifier = $rowData['national_id'] ?? $rowData['employee_number'] ?? null;

                    if (! $identifier) {
                        $totalSkipped++;
                        $this->command->warn("Status sheet '{$sheetName}' row ".($rowIndex + 2).': missing identifier.');

                        continue;
                    }

                    $employee = Employee::where('national_id', $identifier)
                        ->orWhere('employee_number', $identifier)
                        ->first();

                    if (! $employee) {
                        // Create a minimal employee entry
                        $employeeData = $this->extractEmployeeData($rowData);
                        $employee = Employee::create($employeeData);
                        $totalCreated++;
                    }

                    $workDetailData = $this->extractWorkDetailData($rowData, $referenceDataCache);

                    $workDetailData['employment_status_id'] = $statusId;
                    $workDetailData['employment_type_id'] = $workDetailData['employment_type_id']
                        ?? $defaultEmploymentTypeId;

                    // Ensure job scale and program defaults
                    if (! isset($workDetailData['job_scale_id']) || empty($workDetailData['job_scale_id'])) {
                        $workDetailData['job_scale_id'] = $defaultJobScaleId;
                    }

                    if (! isset($workDetailData['program_id']) || empty($workDetailData['program_id'])) {
                        $contractValue = $rowData['contract_value'] ?? null;
                        if ($contractProgramId && $this->isContractEmployee($contractValue)) {
                            $workDetailData['program_id'] = $contractProgramId;
                        } elseif ($defaultProgramId) {
                            $workDetailData['program_id'] = $defaultProgramId;
                        }
                    }

                    if (! isset($workDetailData['ministry_id']) || empty($workDetailData['ministry_id'])) {
                        $workDetailData['ministry_id'] = $defaultMinistryId;
                    }

                    WorkDetail::updateOrCreate(
                        ['employee_id' => $employee->id],
                        $workDetailData
                    );

                    $totalUpdated++;
                } catch (\Exception $e) {
                    $totalSkipped++;
                    $this->command->error("Status sheet '{$sheetName}' row ".($rowIndex + 2).": {$e->getMessage()}");
                }
            }
        }

        $this->command->info("Status update completed. Updated {$totalUpdated}, created {$totalCreated}, skipped {$totalSkipped}.");
    }

    private function mapHeaders(array $headers): array
    {
        $headerMap = [];

        foreach ($headers as $index => $header) {
            if (empty($header)) {
                continue;
            }

            $header = trim($header);
            $normalizedHeader = Str::lower(str_replace([' ', '_', '-'], '', $header));

            // Try to find matching column
            foreach ($this->columnMapping as $dbColumn => $possibleNames) {
                foreach ($possibleNames as $possibleName) {
                    $normalizedPossible = Str::lower(str_replace([' ', '_', '-'], '', $possibleName));

                    if ($normalizedHeader === $normalizedPossible || Str::contains($normalizedHeader, $normalizedPossible)) {
                        $headerMap[$dbColumn] = $index;

                        break 2;
                    }
                }
            }
        }

        return $headerMap;
    }

    private function mapRowData(array $row, array $headerMap): array
    {
        $rowData = [];

        foreach ($headerMap as $dbColumn => $columnIndex) {
            $rowData[$dbColumn] = $row[$columnIndex] ?? null;
        }

        return $rowData;
    }

    private function applyContractMetadata(array $rowData): array
    {
        $hasEmployeeNumberColumn = array_key_exists('employee_number', $rowData);
        $rawValue = $hasEmployeeNumberColumn ? ($rowData['employee_number'] ?? null) : null;

        [$sanitizedNumber, $contractValue] = $this->parseContractValue(
            $rawValue,
            $hasEmployeeNumberColumn
        );

        if ($hasEmployeeNumberColumn) {
            $rowData['employee_number'] = $sanitizedNumber;
        }

        $rowData['contract_value'] = $contractValue;

        return $rowData;
    }

    /**
     * @return array{0: ?string, 1: ?string}
     */
    private function parseContractValue(?string $value, bool $columnPresent): array
    {
        if (! $columnPresent) {
            return [null, null];
        }

        if ($value === null) {
            return [null, $this->defaultContractValue];
        }

        $trimmedValue = trim((string) $value);

        if ($trimmedValue === '') {
            return [null, $this->defaultContractValue];
        }

        $normalizedValue = $this->normalizeText($trimmedValue);

        foreach ($this->contractLabels as $label) {
            if (Str::contains($normalizedValue, $this->normalizeText($label))) {
                return [null, $label];
            }
        }

        return [$trimmedValue, null];
    }

    private function normalizeText(?string $value): string
    {
        if ($value === null) {
            return '';
        }

        return Str::of($value)->squish()->lower()->value();
    }

    private function extractEmployeeData(array $rowData): array
    {
        // Split full name if provided
        $nameParts = $this->splitFullName($rowData['full_name'] ?? null);
        $contractId = $this->resolveContractId($rowData['contract_value'] ?? null);

        $bankId = null;
        if (isset($rowData['bank_id']) && $rowData['bank_id']) {
            $bankId = $this->findReferenceDataId($rowData['bank_id'], 'BANK', $this->referenceDataCache);
        }

        $employeeNumber = $rowData['employee_number'] ?? null;

        $notesSegments = [];

        if (! empty($rowData['notes'])) {
            $notesSegments[] = trim((string) $rowData['notes']);
        }

        if (! empty($rowData['displacement_location'])) {
            $notesSegments[] = 'مكان النزوح: '.trim((string) $rowData['displacement_location']);
        }

        if (! empty($rowData['children_count'])) {
            $notesSegments[] = 'عدد الأولاد: '.trim((string) $rowData['children_count']);
        }

        if (! empty($rowData['spouses_count'])) {
            $notesSegments[] = 'عدد الأزواج/الزوجات: '.trim((string) $rowData['spouses_count']);
        }

        $notes = empty($notesSegments) ? null : implode("\n", $notesSegments);

        return [
            'national_id' => $rowData['national_id'] ?? null,
            'employee_number' => $employeeNumber,
            'contract_id' => $contractId,
            'first_name' => $rowData['first_name'] ?? $nameParts['first_name'] ?? 'غير محدد',
            'second_name' => $rowData['second_name'] ?? $nameParts['second_name'] ?? null,
            'third_name' => $rowData['third_name'] ?? $nameParts['third_name'] ?? null,
            'family_name' => $rowData['family_name'] ?? $nameParts['family_name'] ?? 'غير محدد',
            'birth_date' => $this->parseDate($rowData['birth_date'] ?? null),
            'gender' => $this->normalizeGender($rowData['gender'] ?? null),
            'primary_phone' => $rowData['primary_phone'] ?? null,
            'address' => $rowData['address'] ?? null,
            'date_of_appointment' => $this->parseDate($rowData['date_of_appointment'] ?? null),
            'bank_id' => $bankId,
            'bank_account_number' => $rowData['bank_account_number'] ?? null,
            'bank_iban' => $rowData['bank_iban'] ?? null,
            'is_alive' => true,
            'is_active' => true,
            'data_entry_status' => 'pending',
            'notes' => $notes,
        ];
    }

    private function splitFullName(?string $fullName): array
    {
        $result = [
            'first_name' => null,
            'second_name' => null,
            'third_name' => null,
            'family_name' => null,
        ];

        if (empty($fullName)) {
            return $result;
        }

        // Trim and normalize spaces
        $fullName = trim(preg_replace('/\s+/', ' ', $fullName));

        if (empty($fullName)) {
            return $result;
        }

        // Split by spaces
        $parts = explode(' ', $fullName);
        $parts = array_filter($parts, fn ($part) => ! empty(trim($part)));
        $parts = array_values($parts);

        $count = count($parts);

        if ($count === 0) {
            return $result;
        }

        // Handle different name lengths
        if ($count === 1) {
            // Only one name - put it in first_name
            $result['first_name'] = $parts[0];
            $result['family_name'] = $parts[0];
        } elseif ($count === 2) {
            // Two names - first_name and family_name
            $result['first_name'] = $parts[0];
            $result['family_name'] = $parts[1];
        } elseif ($count === 3) {
            // Three names - first_name, second_name, family_name
            $result['first_name'] = $parts[0];
            $result['second_name'] = $parts[1];
            $result['family_name'] = $parts[2];
        } else {
            // Four or more names
            // first_name, second_name, third_name, and the rest as family_name
            $result['first_name'] = $parts[0];
            $result['second_name'] = $parts[1];
            $result['third_name'] = $parts[2];
            // Join remaining parts as family_name
            $result['family_name'] = implode(' ', array_slice($parts, 3));
        }

        return $result;
    }

    private function extractWorkDetailData(array $rowData, array $referenceDataCache): array
    {
        $workDetailData = [];

        // Map reference data fields
        $referenceFields = [
            'ministry_id' => 'MINISTRY',
            'management_department_id' => 'MANAGEMENT_DEPARTMENT',
            'work_department_id' => 'DEPARTMENT',
            'section_id' => 'SECTION',
            'division_id' => 'DIVISION',
            'unit_id' => 'UNIT',
            'crossing_id' => 'CROSSING',
            'sub_office_id' => 'SUB_OFFICE',
            'job_title_id' => 'JOB_TITLE',
            'employment_status_id' => 'EMPLOYMENT_STATUS',
            'administrative_title_id' => 'ADMINISTRATIVE_TITLE',
            'program_id' => 'PROGRAM',
            'classification_id' => 'CLASSIFICATION',
            'category_id' => 'CATEGORY',
            'job_scale_id' => 'JOB_SCALE',
            'degree_id' => 'DEGREE',
            'certificate_id' => 'CERTIFICATE',
        ];

        foreach ($referenceFields as $field => $referenceType) {
            $value = $rowData[$field] ?? null;

            if ($value) {
                $workDetailData[$field] = $this->findReferenceDataId($value, $referenceType, $referenceDataCache);
            }
        }

        // Map direct fields
        $directFields = ['seniority', 'actual_service', 'promotion', 'salary_purposes', 'notes'];

        foreach ($directFields as $field) {
            if (isset($rowData[$field])) {
                $workDetailData[$field] = $rowData[$field];
            }
        }

        // Handle fragmentation
        if (isset($rowData['fragmentation'])) {
            $workDetailData['fragmentation'] = is_numeric($rowData['fragmentation']) ? (int) $rowData['fragmentation'] : 1000;
        }

        // Handle is_supervisory
        if (isset($rowData['is_supervisory'])) {
            $workDetailData['is_supervisory'] = $this->parseBoolean($rowData['is_supervisory']);
        }

        return $workDetailData;
    }

    private function getDefaultEmploymentStatusId(array &$referenceDataCache): ?int
    {
        return $this->findReferenceDataId('على رأس عمله - داخل الوطن', 'EMPLOYMENT_STATUS', $referenceDataCache);
    }

    private function resolveContractId(?string $contractValue): ?int
    {
        if (! $contractValue) {
            return null;
        }

        return $this->findReferenceDataId($contractValue, $this->contractReferenceName, $this->referenceDataCache);
    }

    private function isContractEmployee(?string $contractValue): bool
    {
        if ($contractValue === null) {
            return false;
        }

        return in_array($contractValue, $this->contractLabels, true);
    }

    private function loadReferenceDataCache(): array
    {
        $cache = [];

        $referenceData = ReferenceData::all();

        foreach ($referenceData as $ref) {
            $cache[$ref->name][$ref->value] = $ref->id;
        }

        return $cache;
    }

    private function findReferenceDataId(?string $value, string $type, array &$cache): ?int
    {
        if (! $value) {
            return null;
        }

        $value = trim($value);

        if (empty($value)) {
            return null;
        }

        // Try exact match
        if (isset($cache[$type][$value])) {
            return $cache[$type][$value];
        }

        // Try case-insensitive match
        foreach ($cache[$type] ?? [] as $refValue => $refId) {
            if (Str::lower($refValue) === Str::lower($value)) {
                // Update cache with original case
                $cache[$type][$value] = $refId;

                return $refId;
            }
        }

        // Value doesn't exist, create it using firstOrCreate to handle unique constraint
        try {
            $referenceData = ReferenceData::firstOrCreate(
                [
                    'name' => $type,
                    'value' => $value,
                ]
            );

            // Add to cache
            if (! isset($cache[$type])) {
                $cache[$type] = [];
            }
            $cache[$type][$value] = $referenceData->id;

            return $referenceData->id;
        } catch (\Exception $e) {
            // If creation fails, try to find it again
            $existing = ReferenceData::where('name', $type)
                ->where('value', $value)
                ->first();

            if ($existing) {
                if (! isset($cache[$type])) {
                    $cache[$type] = [];
                }
                $cache[$type][$value] = $existing->id;

                return $existing->id;
            }

            $this->command->warn("Failed to create reference data: {$type} = {$value}");

            return null;
        }
    }

    private function parseDate(?string $date): ?string
    {
        if (! $date) {
            return null;
        }

        // Try to parse as Excel date (numeric)
        if (is_numeric($date)) {
            try {
                $excelDate = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float) $date);

                return $excelDate->format('Y-m-d');
            } catch (\Exception $e) {
                // Not an Excel date, continue
            }
        }

        // Try to parse as regular date
        try {
            $parsed = date_create_from_format('Y-m-d', $date) ?: date_create_from_format('d/m/Y', $date) ?: date_create_from_format('m/d/Y', $date);

            return $parsed ? $parsed->format('Y-m-d') : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function parseBoolean($value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return (bool) $value;
        }

        $value = Str::lower(trim((string) $value));

        $trueValues = ['true', '1', 'yes', 'y', 'نعم', 'إشرافي', 'supervisory'];
        $falseValues = ['false', '0', 'no', 'n', 'لا'];

        if (in_array($value, $trueValues, true)) {
            return true;
        }

        if (in_array($value, $falseValues, true)) {
            return false;
        }

        // Default to false for any other value
        return false;
    }

    /**
     * Normalize gender values from Arabic to English.
     * Converts Arabic values like "ذكر" to "male" and "أنثى" to "female".
     */
    private function normalizeGender(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        $normalized = trim($value);
        $normalizedLower = Str::lower($normalized);

        // Arabic to English mapping
        $genderMap = [
            'ذكر' => 'male',
            'أنثى' => 'female',
            'male' => 'male',
            'female' => 'female',
            'm' => 'male',
            'f' => 'female',
        ];

        // Check exact match first
        if (isset($genderMap[$normalized])) {
            return $genderMap[$normalized];
        }

        // Check case-insensitive match
        if (isset($genderMap[$normalizedLower])) {
            return $genderMap[$normalizedLower];
        }

        // Check if value contains Arabic characters
        if (mb_strpos($normalized, 'ذكر') !== false || mb_strpos($normalized, 'ذكور') !== false) {
            return 'male';
        }

        if (mb_strpos($normalized, 'أنثى') !== false || mb_strpos($normalized, 'إناث') !== false) {
            return 'female';
        }

        // If no match found, return null (will be handled by database nullable constraint)
        return null;
    }

    private function isDuplicateEntryError(\Exception $e): bool
    {
        if ($e instanceof \Illuminate\Database\QueryException) {
            $errorCode = $e->getCode();
            $errorMessage = $e->getMessage();

            // MySQL duplicate entry error code is 1062
            if ($errorCode === 23000 || $errorCode === 1062) {
                return true;
            }

            // Check error message for duplicate keywords
            if (Str::contains(Str::lower($errorMessage), ['duplicate', 'already exists', 'unique constraint'])) {
                return true;
            }
        }

        return false;
    }
}
