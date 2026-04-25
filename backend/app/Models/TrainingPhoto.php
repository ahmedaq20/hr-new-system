<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class TrainingPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'training_course_id',
        'file_path',
        'captured_at',
        'caption',
    ];

    protected function casts(): array
    {
        return [
            'captured_at' => 'date',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(TrainingCourse::class, 'training_course_id');
    }

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? Storage::disk('public')->url($this->file_path) : null;
    }
}
