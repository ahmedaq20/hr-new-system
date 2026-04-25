<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Governorate;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cities = [
            'محافظة غزة' => [
                'مدينة غزة',
                'الشجاعية',
                'التفاح',
                'الزيتون',
                'الدرج',
                'الرمال',
                'النصر',
                'الصبرة',
                'تل الهوى',
            ],
            'محافظة الشمال' => [
                'جباليا',
                'بيت حانون',
                'بيت لاهيا',
                'مخيم جباليا',
            ],
            'محافظة الوسطى' => [
                'دير البلح',
                'مخيم البريج',
                'مخيم المغازي',
                'مخيم النصيرات',
                'مخيم دير البلح',
                'الزوايدة',
                'وادي السلقا',
                'المصدر',
            ],
            'محافظة خانيونس' => [
                'خان يونس',
                'القرارة',
                'عبسان الكبيرة',
                'عبسان الجديدة',
                'بني سهيلا',
                'خزاعة',
                'السريج',
                'قاع القرين',
                'المواصي',
                'قيزان النجار',
                'الفخاري',
            ],
            'محافظة رفح' => [
                'رفح',
                'الشوكة',
            ],
        ];

        foreach ($cities as $governorateName => $cityNames) {
            $governorate = Governorate::where('name', $governorateName)->first();

            if ($governorate) {
                foreach ($cityNames as $cityName) {
                    City::create([
                        'name' => $cityName,
                        'governorate_id' => $governorate->id,
                    ]);
                }
            }
        }
    }
}
