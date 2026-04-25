<?php

namespace Modules\ReferenceDataModule\Database\Seeders;

use App\Models\ReferenceData;
use Illuminate\Database\Seeder;

class ReferenceDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ReferenceDataModule merges its config into this key.
        $referenceData = config(key: 'reference_data', default: []);

        foreach ($referenceData as $name => $values) {
            foreach ($values as $value) {
                try {

                    if (is_array($value)) {
                        $this->createOrUpdateReferenceData(
                            name: $name,
                            value: $value['value'] ?? null,
                            slug: $value['slug'] ?? null
                        );
                    } else {
                        ReferenceData::firstOrCreate(
                            [
                                'name' => $name,
                                'value' => $value,
                            ]
                        );
                    }
                } catch (\Exception $e) {

                }
            }
        }
    }

    private function createOrUpdateReferenceData(string $name, ?string $value, ?string $slug): void
    {
        if (! $value) {
            return;
        }

        if ($slug) {
            $existing = ReferenceData::query()->where('slug', '=', $slug)->first();

            if ($existing) {
                $existing->update([
                    'name' => $name,
                    'slug' => $slug,
                ]);

                return;
            }

            ReferenceData::create([
                'name' => $name,
                'value' => $value,
                'slug' => $slug,
            ]);

            return;
        }

        ReferenceData::updateOrCreate(
            ['name' => $name, 'value' => $value],
            [
                'name' => $name,
                'value' => $value,
            ]
        );
    }
}
