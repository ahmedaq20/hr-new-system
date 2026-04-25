<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrainingCourse extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'training_type_id',
        'training_classification_id',
        'name',
        'target_audience',
        'funding_entity',
        'duration',
        'implementation_mechanism',
        'content',
        'location',
        'other_details',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function trainingType(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'training_type_id');
    }

    public function trainingClassification(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'training_classification_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(TrainingParticipant::class);
    }

    public function supervisors(): HasMany
    {
        return $this->hasMany(TrainingSupervisor::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(TrainingAttendance::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(TrainingPhoto::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(TrainingCertificate::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TrainingAttachment::class);
    }

    public function employeeParticipants(): HasMany
    {
        return $this->hasMany(TrainingParticipant::class)->with('employee');
    }

    public function getParticipantsCountAttribute(): int
    {
        return $this->participants()->count();
    }

    public function getSupervisorsCountAttribute(): int
    {
        return $this->supervisors()->count();
    }
}
