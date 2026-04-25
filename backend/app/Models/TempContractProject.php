<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TempContractProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'duration',
        'start_date',
        'end_date',
        'funding_source',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }
}
