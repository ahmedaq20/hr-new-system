<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payslip>
 */
class PayslipFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $year = (int) fake()->numberBetween(now()->year - 1, now()->year);
        $month = (int) fake()->numberBetween(1, 12);

        return [
            'year' => $year,
            'month' => $month,
            'file_path' => "payslips/{$year}/{$month}/example.pdf",
            'uploaded_by' => null,
            'type' => \App\Models\Payslip::TYPE_MASTER,
        ];
    }
}
