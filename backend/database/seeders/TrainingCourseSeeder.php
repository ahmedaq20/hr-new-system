<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\ReferenceData;
use App\Models\TrainingCourse;
use App\Models\TrainingParticipant;
use App\Models\TrainingSupervisor;
use Illuminate\Database\Seeder;

class TrainingCourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get training type "دورة" and classification "داخلي"
        $trainingTypeId = ReferenceData::where('name', 'TRAINING_TYPE')
            ->where('value', 'دورة')
            ->first()?->id;

        $trainingClassificationId = ReferenceData::where('name', 'TRAINING_CLASSIFICATION')
            ->where('value', 'داخلي')
            ->first()?->id;

        // Create the training course
        $course = TrainingCourse::create([
            'training_type_id' => $trainingTypeId,
            'training_classification_id' => $trainingClassificationId,
            'name' => 'فحص ومراقبة الجودة للحوم والدواجن',
            'target_audience' => 'مفتشو الجودة والأطباء البيطريون وموظفو قسم الرقابة الغذائية',
            'funding_entity' => 'وزارة الاقتصاد الوطني',
            'duration' => '5 أيام',
            'implementation_mechanism' => 'حضوري - محاضرات نظرية وتطبيقات عملية ميدانية',
            'content' => 'أولاً: المعايير والمواصفات الفنية لفحص اللحوم والدواجن
- المواصفات الفلسطينية للحوم الحمراء والدواجن
- معايير منظمة الصحة العالمية WHO
- متطلبات نظام HACCP في صناعة اللحوم

ثانياً: الفحص الظاهري والحسي
- فحص اللون والرائحة والقوام
- علامات الفساد والتلف
- كشف الغش والتزوير

ثالثاً: الفحوصات المخبرية
- اختبارات التلوث الميكروبي (السالمونيلا، الإي كولاي، الليستيريا)
- اختبارات المتبقيات الدوائية والهرمونية
- اختبارات المعادن الثقيلة

رابعاً: إجراءات المراقبة الميدانية
- التفتيش على المسالخ والمجازر
- مراقبة سلسلة التبريد
- إجراءات الحجر والإتلاف',
            'location' => 'غزة - الغرفة التجارية - بجوار ترخيص السامر',
            'other_details' => 'يحصل المشاركون على شهادة معتمدة من وزارة الاقتصاد الوطني
- يتم توفير المواد التدريبية والوجبات
- زيارة ميدانية لمختبر فحص الأغذية',
            'start_date' => now()->addDays(14)->format('Y-m-d'),
            'end_date' => now()->addDays(18)->format('Y-m-d'),
            'is_active' => true,
        ]);

        // Get 15 random employees who are "على رأس عمله" (employment_status_id = 90)
        $employmentStatusId = ReferenceData::where('name', 'EMPLOYMENT_STATUS')
            ->where('value', 'على رأس عمله')
            ->first()?->id;

        $participantEmployees = Employee::query()
            ->whereHas('workDetail', function ($query) use ($employmentStatusId) {
                $query->where('employment_status_id', $employmentStatusId);
            })
            ->whereNull('deleted_at')
            ->inRandomOrder()
            ->limit(15)
            ->get();

        // Add participants
        foreach ($participantEmployees as $employee) {
            TrainingParticipant::create([
                'training_course_id' => $course->id,
                'employee_id' => $employee->id,
            ]);
        }

        // Get internal supervisor from "الفئة الأولى" or similar high category
        $categoryIds = ReferenceData::where('name', 'CATEGORY')
            ->whereIn('value', ['الفئة العليا', 'الفئة الأولى', 'الفئة الأولى-6', 'الفئة الأولى -6', 'الفئة الاولى - 6', 'الفئة الاولى -6'])
            ->pluck('id');

        $internalSupervisor = Employee::query()
            ->whereHas('workDetail', function ($query) use ($categoryIds) {
                $query->whereIn('category_id', $categoryIds);
            })
            ->whereNull('deleted_at')
            ->first();

        if ($internalSupervisor) {
            TrainingSupervisor::create([
                'training_course_id' => $course->id,
                'employee_id' => $internalSupervisor->id,
                'is_external' => false,
                'notes' => 'مشرف داخلي - الفئة الأولى',
            ]);
        }

        // Add external supervisor - Dr. Saud Al-Shawa
        TrainingSupervisor::create([
            'training_course_id' => $course->id,
            'employee_id' => null,
            'is_external' => true,
            'external_name' => 'الدكتور سعود الشوا',
            'external_experience' => 'دكتوراه في علوم الأغذية والتغذية - جامعة القاهرة
خبرة أكثر من 20 عاماً في مجال فحص جودة الأغذية واللحوم
استشاري معتمد لدى منظمة الأغذية والزراعة (FAO)
محاضر في عدة جامعات فلسطينية في مجال سلامة الغذاء
شارك في إعداد العديد من المواصفات الفلسطينية للأغذية',
            'external_contact_method' => 'يمكن التواصل من خلال البريد الالكتروني فقط dr.saud.alshawa@gmail.com',
            'external_notes' => 'متخصص في فحص اللحوم والدواجن
متفرغ للتدريب أيام الأحد والثلاثاء والخميس',
        ]);

        $this->command->info('تم إنشاء دورة "فحص ومراقبة الجودة للحوم والدواجن" بنجاح!');
        $this->command->info('- تم إضافة '.$participantEmployees->count().' مشارك');
        $this->command->info('- تم إضافة مشرف داخلي من الفئة الأولى');
        $this->command->info('- تم إضافة مشرف خارجي: الدكتور سعود الشوا');
    }
}
