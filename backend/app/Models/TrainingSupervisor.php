<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingSupervisor extends Model
{
    use HasFactory;

    protected $fillable = [
        'training_course_id',
        'employee_id',
        'is_external',
        'external_name',
        'external_experience',
        'external_contact_method',
        'external_notes',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'is_external' => 'boolean',
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

    public function getNameAttribute(): string
    {
        if ($this->is_external) {
            return $this->external_name ?? '-';
        }

        return $this->employee?->full_name ?? '-';
    }
}
