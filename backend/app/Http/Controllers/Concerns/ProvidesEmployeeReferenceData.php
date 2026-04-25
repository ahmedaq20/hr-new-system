<?php

namespace App\Http\Controllers\Concerns;

use App\Models\ReferenceData;
use Illuminate\Support\Collection;

trait ProvidesEmployeeReferenceData
{
    protected function getEmployeeReferenceData(): Collection
    {
        $filterKeys = [
            'MINISTRY',
            'MANAGEMENT_DEPARTMENT',
            'DEPARTMENT',
            'SECTION',
            'DIVISION',
            'UNIT',
            'CROSSING',
            'SUB_OFFICE',
            'JOB_TITLE',
            'EMPLOYMENT_STATUS',
            'EMPLOYMENT_TYPE',
            'PROGRAM',
            'CLASSIFICATION',
            'CATEGORY',
            'CERTIFICATE',
            'DEGREE',
        ];

        return ReferenceData::whereIn('name', $filterKeys)
            ->orderBy('value')
            ->get()
            ->groupBy('name');
    }
}
