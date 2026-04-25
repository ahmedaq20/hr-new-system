<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\Governorate;
use App\Models\ReferenceData;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstName = $this->faker->firstName();
        $secondName = $this->faker->firstName();
        $thirdName = $this->faker->firstName();
        $familyName = $this->faker->lastName();

        $governorate = Governorate::inRandomOrder()->first();
        $city = $governorate ? City::where('governorate_id', $governorate->id)->inRandomOrder()->first() : null;
        $bank = ReferenceData::where('name', 'BANK')->inRandomOrder()->first();

        return [
            'first_name' => $firstName,
            'second_name' => $secondName,
            'third_name' => $thirdName,
            'family_name' => $familyName,
            'employee_number' => $this->faker->unique()->numerify('#####'),
            'birth_date' => $this->faker->date('Y-m-d', '-25 years'),
            'is_alive' => $this->faker->boolean(95),
            'gender' => $this->faker->randomElement(['male', 'female']),
            'marital_status' => $this->faker->randomElement(['married', 'single', 'divorced', 'widowed']),
            'primary_phone' => $this->faker->phoneNumber(),
            'secondary_phone' => $this->faker->optional()->phoneNumber(),
            'governorate_id' => $governorate?->id,
            'city_id' => $city?->id,
            'address' => $this->faker->streetAddress(),
            'date_of_appointment' => $this->faker->date('Y-m-d', '-5 years'),
            'bank_id' => $bank?->id,
            'bank_account_number' => $this->faker->numerify('############'),
            'bank_iban' => 'PS'.$this->faker->numerify('####################'),
            'user_id' => User::factory(),
            'is_active' => true,
            'data_entry_status' => 'approved',
        ];
    }
}
