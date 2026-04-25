<?php

namespace App\Support;

use App\Models\ReferenceData;
use App\Models\WorkDetail;

class EmployeeClassification
{
    public static function definitions(): array
    {
        return [
            'official' => [
                'label' => 'الرسميين',
                'value' => 'رسمي',
                'slug' => 'employment_type.official',
                'reference_type' => 'EMPLOYMENT_TYPE',
                'filter_param' => 'filter_employment_type',
                'icon' => 'ti ti-shield-check',
                'color' => 'emerald',
            ],
            'official_other_government' => [
                'label' => 'رسميين في حكومة أخرى',
                'value' => 'رسمي في حكومة أخرى',
                'slug' => 'employment_type.official_other_government',
                'reference_type' => 'EMPLOYMENT_TYPE',
                'filter_param' => 'filter_employment_type',
                'icon' => 'ti ti-building',
                'color' => 'sky',
            ],
            'dismissed' => [
                'label' => 'المفصولين',
                'value' => 'مفصول',
                'slug' => 'employment_status.dismissed',
                'reference_type' => 'EMPLOYMENT_STATUS',
                'filter_param' => 'filter_employment_status',
                'icon' => 'ti ti-user-off',
                'color' => 'rose',
            ],
            'retired' => [
                'label' => 'المتقاعدين',
                'value' => 'متقاعد',
                'slug' => 'employment_status.retired',
                'reference_type' => 'EMPLOYMENT_STATUS',
                'filter_param' => 'filter_employment_status',
                'custom_route' => 'retirees.index',
                'icon' => 'ti ti-beach',
                'color' => 'amber',
            ],
        ];
    }

    public static function resolveReference(array $definition): ?ReferenceData
    {
        $query = ReferenceData::query()->where('name', $definition['reference_type']);

        if (! empty($definition['slug'])) {
            $reference = (clone $query)->where('slug', $definition['slug'])->first();
            if ($reference) {
                return $reference;
            }
        }

        if (! empty($definition['value'])) {
            return ReferenceData::query()
                ->where('name', $definition['reference_type'])
                ->where('value', $definition['value'])
                ->first();
        }

        return null;
    }

    public static function stats(): array
    {
        return collect(static::definitions())->map(function (array $definition, string $slug) {
            $reference = static::resolveReference($definition);
            $referenceId = $reference->id ?? null;

            $column = match ($definition['reference_type']) {
                'EMPLOYMENT_TYPE' => 'employment_type_id',
                'EMPLOYMENT_STATUS' => 'employment_status_id',
                default => 'employment_type_id',
            };

            $count = $referenceId ? WorkDetail::where($column, $referenceId)->count() : 0;

            return array_merge($definition, [
                'slug' => $slug,
                'reference_id' => $referenceId,
                'count' => $count,
            ]);
        })->all();
    }
}
