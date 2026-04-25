<?php

namespace App\Providers;

use App\Models\Employee;
use App\Models\ReferenceData;
use App\Models\TempContractEmployee;
use App\Models\TempContractProject;
use App\Support\EmployeeClassification;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Services\Storage\TrainingAttachmentStorageInterface::class,
            \App\Services\Storage\LocalStorageService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::before(function ($user, $ability) {
            return $user->hasRole('super admin') ? true : null;
        });

        View::composer('layouts.partials.sidebar', function ($view) {
            // الترتيب المطلوب حسب الأولوية
            $orderedTypes = [
                'MINISTRY',
                'EMPLOYMENT_TYPE',
                'CLASSIFICATION',
                'CATEGORY',
                'JOB_SCALE',
                'DEGREE',
                'PROGRAM',
                'WORKPLACE',
                'ADMINISTRATIVE_TITLE',
                'RETIREMENT_COMMITTEE',
                'CERTIFICATE',
            ];

            // الحصول على جميع الأنواع من قاعدة البيانات
            $allTypes = ReferenceData::distinct()
                ->where('name', '!=', 'QUALIFICATION')
                ->pluck('name')
                ->toArray();

            // ترتيب الأنواع: أولاً المطلوبة بالترتيب، ثم الباقي
            $orderedReferenceDataTypes = [];
            $remainingTypes = [];

            // إضافة الأنواع المطلوبة بالترتيب
            foreach ($orderedTypes as $type) {
                if (in_array($type, $allTypes)) {
                    $orderedReferenceDataTypes[] = $type;
                }
            }

            // إضافة باقي الأنواع
            foreach ($allTypes as $type) {
                if (! in_array($type, $orderedTypes)) {
                    $remainingTypes[] = $type;
                }
            }

            // دمج القوائم
            $referenceDataTypes = array_merge($orderedReferenceDataTypes, $remainingTypes);

            $typeLabels = [
                'MINISTRY' => 'الوزارات',
                'SUB_OFFICE' => 'المكاتب الفرعية',
                'EMPLOYMENT_TYPE' => 'أنواع الموظفين',
                'CLASSIFICATION' => 'تصنيفات الموظفين العامة',
                'CATEGORY' => 'الفئات',
                'JOB_SCALE' => 'السلم الوظيفي',
                'DEGREE' => 'الدرجات',
                'PROGRAM' => 'البرامج',
                'WORKPLACE' => 'أماكن العمل',
                'ADMINISTRATIVE_TITLE' => 'المسميات الادارية',
                'RETIREMENT_COMMITTEE' => 'لجان التقاعد',
                'CERTIFICATE' => 'الشهادات',
                'MANAGEMENT_DEPARTMENT' => 'الإدارة العامة',
                'DEPARTMENT' => 'الدائرة',
                'SECTION' => 'القسم',
                'DIVISION' => 'الشعبة',
                'UNIT' => 'الوحدة',
                'CROSSING' => 'المعبر',
                'JOB_TITLE' => 'المسمى الوظيفي',
                'EMPLOYMENT_STATUS' => 'الحالة الوظيفية',
                'BANK' => 'البنوك',
                'CONTRACT' => 'عقود التشغيل',
                'EMPLOYEE_DOCUMENT' => 'وثائق الموظفين',
            ];

            $contractDefinitions = [
                'permanent' => [
                    'label' => 'عقود تشغيل دائمة',
                    'value' => 'عقد دائم',
                ],
                'paused' => [
                    'label' => 'عقود تشغيل متوقفة',
                    'value' => 'عقد متوقف',
                ],
                'unknown' => [
                    'label' => 'عقود تشغيل غير معلومة',
                    'value' => 'عقد غير معلوم',
                ],
            ];

            $contractReference = ReferenceData::where('name', 'CONTRACT')
                ->whereIn('value', collect($contractDefinitions)->pluck('value')->all())
                ->get()
                ->keyBy('value');

            $contractCounts = Employee::selectRaw('contract_id, COUNT(*) as aggregate')
                ->whereIn('contract_id', $contractReference->pluck('id')->filter()->all())
                ->groupBy('contract_id')
                ->pluck('aggregate', 'contract_id');

            $contractMenu = collect($contractDefinitions)->map(function ($definition, $slug) use ($contractReference, $contractCounts) {
                $contract = $contractReference->get($definition['value']);
                $count = $contract ? ($contractCounts[$contract->id] ?? 0) : 0;

                return [
                    'slug' => $slug,
                    'label' => $definition['label'],
                    'value' => $definition['value'],
                    'count' => $count,
                ];
            });

            $classificationMenu = collect(EmployeeClassification::stats())->map(function ($definition) {
                return [
                    'slug' => $definition['slug'] ?? null,
                    'label' => $definition['label'],
                    'value' => $definition['value'] ?? null,
                    'count' => $definition['count'] ?? 0,
                    'reference_id' => $definition['reference_id'] ?? null,
                    'filter_param' => $definition['filter_param'] ?? null,
                    'custom_route' => $definition['custom_route'] ?? null,
                ];
            });

            $temporaryProgramsCount = TempContractProject::count();
            $tempContractEmployeesCount = TempContractEmployee::count();

            $view->with('referenceDataTypes', $referenceDataTypes)
                ->with('typeLabels', $typeLabels)
                ->with('contractMenu', $contractMenu)
                ->with('classificationMenu', $classificationMenu)
                ->with('temporaryProgramsCount', $temporaryProgramsCount)
                ->with('tempContractEmployeesCount', $tempContractEmployeesCount);
        });
    }
}
