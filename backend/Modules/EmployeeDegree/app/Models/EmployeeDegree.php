<?php

namespace Modules\EmployeeDegree\Models;

use App\Models\Employee;
use App\Models\ReferenceData;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmployeeDegree extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'qualification_id',
        'major_name',
        'university_name',
        'graduation_year',
        'document_path',
        'grade',
        'certificate_attachment',
        'notes',
        'approval_status',
        'submitted_by',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'graduation_year' => 'integer',
            'approved_at' => 'datetime',
        ];
    }

    /**
     * Get the employee that owns the degree.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the qualification reference data.
     */
    public function qualification(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'qualification_id');
    }

    /**
     * Check if the record is pending approval.
     */
    public function isPending(): bool
    {
        return $this->approval_status === 'pending';
    }

    /**
     * Check if the record is approved.
     */
    public function isApproved(): bool
    {
        return $this->approval_status === 'approved';
    }

    /**
     * Check if the record is rejected.
     */
    public function isRejected(): bool
    {
        return $this->approval_status === 'rejected';
    }

    /**
     * Get the user who submitted this record.
     */
    public function submitter(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'submitted_by');
    }

    /**
     * Get the user who approved this record.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'approved_by');
    }

}
