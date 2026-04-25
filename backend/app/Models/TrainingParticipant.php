<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class TrainingParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'training_course_id',
        'employee_id',
        'notes',
        'approval_status',
        'certificate_path',
        'submitted_by',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'manual_course_name',
        'manual_institution',
        'course_hours',
        'course_date',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
        ];
    }

    public function trainingCourse(): BelongsTo
    {
        return $this->belongsTo(TrainingCourse::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
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

    public function getCertificateUrlAttribute(): ?string
    {
        return $this->certificate_path ? Storage::disk('public')->url($this->certificate_path) : null;
    }
}
