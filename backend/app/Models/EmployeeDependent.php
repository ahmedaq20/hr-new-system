<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class EmployeeDependent extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'employee_dependents';

    protected $fillable = [
        'employee_id',
        'full_name',
        'dependent_id_number',
        'birth_date',
        'mobile',
        'relationship',
        'address',
        'gender',
        'notes',
        'dependency_proof_path',
        'approval_status',
        'submitted_by',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'approved_at' => 'datetime',
        ];
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

    /**
     * Scope for pending approval records.
     */
    public function scopePending($query)
    {
        return $query->where('approval_status', 'pending');
    }

    /**
     * Scope for approved records.
     */
    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    /**
     * Scope for rejected records.
     */
    public function scopeRejected($query)
    {
        return $query->where('approval_status', 'rejected');
    }

    public function getDependencyProofUrlAttribute(): ?string
    {
        return $this->dependency_proof_path ? Storage::disk('public')->url($this->dependency_proof_path) : null;
    }
}
