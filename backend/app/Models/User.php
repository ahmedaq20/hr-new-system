<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, HasApiTokens, Notifiable;

    protected $guard_name = 'api';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'national_id',
        'email',
        'password',
        'profile_photo',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the employee record associated with the user.
     */
    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class);
    }

    /**
     * Get the audit logs for the user.
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Get the profile photo URL attribute.
     * Priority: user uploaded photo > employee image > gender placeholder > default
     */
    public function getProfilePhotoUrlAttribute(): string
    {
        // First, check if user has uploaded a profile photo
        if ($this->profile_photo) {
            /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
            $disk = Storage::disk('public');
            return $disk->url($this->profile_photo);
        }

        // Second, check if user has an employee relationship with an image
        $employee = $this->employee;
        if ($employee) {
            // Check if employee has a profile image field (if it exists in the future)
            // For now, we'll use gender-based placeholders

            // Use gender-based placeholder if employee has gender
            if ($employee->gender) {
                $gender = strtolower($employee->gender);
                $placeholderPath = "images/placeholder-{$gender}";

                if (file_exists(public_path("images/placeholder-{$gender}.png"))) {
                    return asset("images/placeholder-{$gender}.png");
                } elseif (file_exists(public_path("images/placeholder-{$gender}.jpg"))) {
                    return asset("images/placeholder-{$gender}.jpg");
                } elseif (file_exists(public_path("img/{$gender}-placeholder.png"))) {
                    return asset("img/{$gender}-placeholder.png");
                }
            }
        }

        // Fallback to default placeholder
        if (file_exists(public_path('img/male-placeholder.png'))) {
            return asset('img/male-placeholder.png');
        }

        // Final fallback
        return asset('img/users/user-04.jpg');
    }
}
