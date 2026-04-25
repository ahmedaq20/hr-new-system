<?php

namespace Modules\CoreModule\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardResource;
use App\Models\Employee;
use App\Support\EmployeeClassification;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index()
    {
        $totalEmployees = Employee::count();

        $classificationCards = $this->buildClassificationCards();

        $groupData = [
            'totalEmployees' => $totalEmployees,
            'classificationCards' => $classificationCards,
        ];

        return new DashboardResource($groupData);
    }

    private function buildClassificationCards(): array
    {
        return EmployeeClassification::stats();
    }
}
