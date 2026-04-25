<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TempContractEmployee extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [

        'temp_contract_project_id',
        'first_name',
        'second_name',
        'third_name',
        'family_name',
        'full_name',
        'national_id',
        'primary_phone',
        'secondary_phone',
        'gender',
        'marital_status',
        'birth_date',
        'position_type',
        'start_contract_date',
        'end_contract_date',
        'governorate_id',
        'city_id',
        'address',
        'certificate_id',
        'university_name',
        'major_name',
        'graduation_date',
        'is_active',
        'data_entry_status',
        'notes',
        //        'bank_id',
        //        'bank_account_number',
        //        'bank_iban',
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
            'start_contract_date' => 'date',
            'end_contract_date' => 'date',
            'is_active' => 'boolean',
        ];
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
     * Get the contract reference for the employee.
     */
    public function certificate(): BelongsTo
    {
        return $this->belongsTo(ReferenceData::class, 'certificate_id');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(TempContractProject::class, 'temp_contract_project_id');
    }

    /**
     * Get all of the employee's audit logs.
     */
    public function auditLogs(): MorphMany
    {
        return $this->morphMany(AuditLog::class, 'loggable');
    }
}
