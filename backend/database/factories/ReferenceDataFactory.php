<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ReferenceData>
 */
class ReferenceDataFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $referenceData = config('reference_data');
        $names = array_keys($referenceData);
        $name = $this->faker->randomElement($names);

        return [
            'name' => $name,
            'value' => $this->faker->randomElement($referenceData[$name]),
        ];
    }
}
