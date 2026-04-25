<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkDetail extends Model
{
    /** @use HasFactory<\Database\Factories\WorkDetailFactory> */
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'employee_id',

        // 1. البيانات التنظيمية (Organizational Data)
        'ministry_id',
        'management_department_id',
        'work_department_id',
        'section_id',
        'division_id',
        'unit_id',
        'crossing_id',
        'sub_office_id',

        // 2. البيانات الوظيفية (Job Data)
        'job_title_id',
        'employment_status_id',
        'employment_type_id',
        'administrative_title_id',
        'program_id',

        // 3. بيانات التصنيف والدرجة (Classification and Grade Data)
        'classification_id',
        'category_id',
        'job_scale_id',
        'degree_id',
        'seniority',

        // 4. البيانات المهنية والمؤهلات (Professional Data)
        'certificate_id',
        'actual_service',
        'promotion',
        'salary_purposes',

        // 5. بيانات إدارية إضافية (Additional Administrative Data)
        'fragmentation',
        'is_supervisory',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fragmentation' => 'decimal:2',
            'is_supervisory' => 'boolean',
        ];
    }

    /**
     * Get the employee that owns the work details.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the ministry reference data.
     */
    public function ministry(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'ministry_id');
    }

    /**
     * Get the classification reference data.
     */
    public function classification(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'classification_id');
    }

    /**
     * Get the category reference data.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'category_id');
    }

    /**
     * Get the job scale reference data.
     */
    public function jobScale(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'job_scale_id');
    }

    /**
     * Get the degree reference data.
     */
    public function degree(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'degree_id');
    }

    /**
     * Get the program reference data.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'program_id');
    }

    /**
     * Get the job title reference data.
     */
    public function jobTitle(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'job_title_id');
    }

    /**
     * Get the employment status reference data.
     */
    public function employmentStatus(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'employment_status_id');
    }

    /**
     * Get the employment status classification reference data.
     */
    public function employmentType(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'employment_type_id');
    }

    /**
     * Get the administrative title reference data.
     */
    public function administrativeTitle(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'administrative_title_id');
    }

    /**
     * Get the certificate reference data.
     */
    public function certificate(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'certificate_id');
    }

    /**
     * Get the division reference data.
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'division_id');
    }

    /**
     * Get the section reference data.
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'section_id');
    }

    /**
     * Get the work department reference data.
     */
    public function workDepartment(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'work_department_id');
    }

    /**
     * Get the unit reference data.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'unit_id');
    }

    /**
     * Get the management department reference data.
     */
    public function managementDepartment(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'management_department_id');
    }

    /**
     * Get the sub-office reference data.
     */
    public function subOffice(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'sub_office_id');
    }

    /**
     * Get the crossing reference data.
     */
    public function crossing(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'crossing_id');
    }
}
