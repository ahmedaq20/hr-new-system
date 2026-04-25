<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\EmployeeDegree\Models\EmployeeDegree;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'second_name',
        'third_name',
        'family_name',
        'employee_number',
        'contract_id',
        'birth_date',
        'is_alive',
        'gender',
        'marital_status',
        'primary_phone',
        'secondary_phone',
        'email',

        'governorate_id',
        'city_id',
        'address',
        'date_of_appointment',

        'bank_id',
        'bank_account_number',
        'bank_iban',

        'user_id',
        'national_id',

        'is_active',
        'data_entry_status',
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
            'birth_date' => 'date',
            'date_of_appointment' => 'date',
            'is_alive' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the user associated with the employee.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the governorate that owns the employee.
     */
    public function governorate(): BelongsTo
    {
        return $this->belongsTo(Governorate::class);
    }

    /**
     * Get the city that owns the employee.
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Get the bank that owns the employee.
     */
    public function bank(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'bank_id');
    }

    /**
     * Get the contract reference for the employee.
     */
    public function contract(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'contract_id');
    }

    /**
     * Get the family members for the employee.
     */
    public function familyMembers(): HasMany
    {
        return $this->hasMany(FamilyMember::class);
    }

    /**
     * Get the degrees for the employee.
     */
    public function degrees(): HasMany
    {
        return $this->hasMany(EmployeeDegree::class);
    }

    /**
     * Get the work details for the employee.
     */
    public function workDetail(): HasOne
    {
        return $this->hasOne(WorkDetail::class);
    }

    /**
     * Get all of the employee's audit logs.
     */
    public function auditLogs(): MorphMany
    {
        return $this->morphMany(AuditLog::class, 'loggable');
    }

    /**
     * Get the employee's documents.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(EmployeeDocument::class);
    }

    /**
     * Get the spouses for the employee.
     */
    public function spouses(): HasMany
    {
        return $this->hasMany(EmployeeSpouse::class);
    }

    public function children(): HasMany
    {
        return $this->hasMany(EmployeeChild::class);
    }

    /**
     * Get the dependents for the employee.
     */
    public function dependents(): HasMany
    {
        return $this->hasMany(EmployeeDependent::class);
    }

    /**
     * Get the training participants for the employee.
     */
    public function trainingParticipants(): HasMany
    {
        return $this->hasMany(TrainingParticipant::class);
    }

    /**
     * Get the employee's full name.
     */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->second_name} {$this->third_name} {$this->family_name}");
    }

    /**
     * Calculate the retirement year based on birth_date + 60 years.
     */
    public function getRetirementYearAttribute(): ?int
    {
        if (! $this->birth_date) {
            return null;
        }

        return Carbon::parse($this->birth_date)->addYears(60)->year;
    }

    /**
     * Check if employee should be retired based on birth_date + 60 years.
     */
    public function shouldBeRetired(): bool
    {
        if (! $this->birth_date) {
            return false;
        }

        $retirementDate = Carbon::parse($this->birth_date)->addYears(60);
        $now = Carbon::now();

        return $retirementDate->year < $now->year
            || ($retirementDate->year === $now->year && $retirementDate->month <= $now->month);
    }
}
