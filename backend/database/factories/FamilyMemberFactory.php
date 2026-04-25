<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FamilyMember>
 */
class FamilyMemberFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'full_name' => $this->faker->name(),
            'national_id' => $this->faker->unique()->numerify('##########'),
            'birth_date' => $this->faker->date('Y-m-d', '-10 years'),
            'gender' => $this->faker->randomElement(['male', 'female']),
            'marital_status' => $this->faker->randomElement(['married', 'single', 'divorced', 'widowed']),
            'relationship_type' => $this->faker->randomElement(['spouse', 'child', 'parent', 'sibling', 'other']),
            'employee_id' => \App\Models\Employee::factory(),
        ];
    }
}
