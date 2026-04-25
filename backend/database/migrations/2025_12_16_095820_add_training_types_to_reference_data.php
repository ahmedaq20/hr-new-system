<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The allowed reference data types (with training types).
     */
    private array $typesWithTraining = [
        'QUALIFICATION',
        'DEPARTMENT',
        'JOB_TITLE',
        'MINISTRY',
        'CLASSIFICATION',
        'CATEGORY',
        'JOB_SCALE',
        'PROGRAM',
        'WORKPLACE',
        'POSITION',
        'ADMINISTRATIVE_TITLE',
        'RETIREMENT_COMMITTEE',
        'CERTIFICATE',
        'DEGREE',
        'DIVISION',
        'SECTION',
        'UNIT',
        'MANAGEMENT_DEPARTMENT',
        'SUB_OFFICE',
        'CROSSING',
        'EMPLOYMENT_STATUS',
        'EMPLOYMENT_TYPE',
        'BANK',
        'CONTRACT',
        'EMPLOYEE_DOCUMENT',
        'TRAINING_TYPE',
        'TRAINING_CLASSIFICATION',
    ];

    /**
     * The original reference data types (without training types).
     */
    private array $typesWithoutTraining = [
        'QUALIFICATION',
        'DEPARTMENT',
        'JOB_TITLE',
        'MINISTRY',
        'CLASSIFICATION',
        'CATEGORY',
        'JOB_SCALE',
        'PROGRAM',
        'WORKPLACE',
        'POSITION',
        'ADMINISTRATIVE_TITLE',
        'RETIREMENT_COMMITTEE',
        'CERTIFICATE',
        'DEGREE',
        'DIVISION',
        'SECTION',
        'UNIT',
        'MANAGEMENT_DEPARTMENT',
        'SUB_OFFICE',
        'CROSSING',
        'EMPLOYMENT_STATUS',
        'EMPLOYMENT_TYPE',
        'BANK',
        'CONTRACT',
        'EMPLOYEE_DOCUMENT',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            $this->upPostgres();
        } elseif ($driver === 'mysql') {
            $this->upMysql();
        } elseif ($driver === 'sqlite') {
            Schema::table('reference_data', function (Blueprint $table) {
                $table->string('name')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove any training reference data first
        DB::table('reference_data')
            ->whereIn('name', ['TRAINING_TYPE', 'TRAINING_CLASSIFICATION'])
            ->delete();

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            $this->downPostgres();
        } elseif ($driver === 'mysql') {
            $this->downMysql();
        } elseif ($driver === 'sqlite') {
            // For SQLite, we don't strictly need to revert to enum as it might fail
            // but keeping it as string is safe.
        }
    }

    /**
     * PostgreSQL: Add new types to CHECK constraint.
     */
    private function upPostgres(): void
    {
        DB::statement('ALTER TABLE reference_data DROP CONSTRAINT IF EXISTS reference_data_name_check');

        $values = collect($this->typesWithTraining)
            ->map(fn ($type) => "'{$type}'::character varying")
            ->implode(', ');

        DB::statement("ALTER TABLE reference_data ADD CONSTRAINT reference_data_name_check CHECK (name::text = ANY (ARRAY[{$values}]::text[]))");
    }

    /**
     * PostgreSQL: Restore original CHECK constraint.
     */
    private function downPostgres(): void
    {
        DB::statement('ALTER TABLE reference_data DROP CONSTRAINT IF EXISTS reference_data_name_check');

        $values = collect($this->typesWithoutTraining)
            ->map(fn ($type) => "'{$type}'::character varying")
            ->implode(', ');

        DB::statement("ALTER TABLE reference_data ADD CONSTRAINT reference_data_name_check CHECK (name::text = ANY (ARRAY[{$values}]::text[]))");
    }

    /**
     * MySQL: Modify ENUM column to include new types.
     */
    private function upMysql(): void
    {
        $values = collect($this->typesWithTraining)
            ->map(fn ($type) => "'{$type}'")
            ->implode(', ');

        DB::statement("ALTER TABLE reference_data MODIFY COLUMN name ENUM({$values}) NOT NULL");
    }

    /**
     * MySQL: Restore original ENUM column.
     */
    private function downMysql(): void
    {
        $values = collect($this->typesWithoutTraining)
            ->map(fn ($type) => "'{$type}'")
            ->implode(', ');

        DB::statement("ALTER TABLE reference_data MODIFY COLUMN name ENUM({$values}) NOT NULL");
    }
};
