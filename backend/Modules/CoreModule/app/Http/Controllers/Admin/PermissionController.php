<?php

namespace Modules\CoreModule\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Display a listing of permissions grouped by category.
     */
    public function index(): JsonResponse
    {
        $permissions = Permission::where('guard_name', 'api')->get();
        
        $grouped = $permissions->groupBy(function ($permission) {
            $name = $permission->name;
            if (str_contains($name, 'employee') || str_contains($name, 'contract') || str_contains($name, 'program')) return 'إدارة الموظفين والعقود';
            if (str_contains($name, 'role') || str_contains($name, 'permission') || str_contains($name, 'user')) return 'المستخدمين والصلاحيات';
            if (str_contains($name, 'slip') || str_contains($name, 'salary') || str_contains($name, 'allowance') || str_contains($name, 'deduction')) return 'الشؤون المالية';
            if (str_contains($name, 'report')) return 'التقارير والإحصائيات';
            if (str_contains($name, 'log') || str_contains($name, 'audit')) return 'سجلات النظام';
            if (str_contains($name, 'lookup') || str_contains($name, 'setting') || str_contains($name, 'constant')) return 'إعدادات النظام وعملياته';
            if (str_contains($name, 'training') || str_contains($name, 'attendance') || str_contains($name, 'academic') || str_contains($name, 'certificate')) return 'التطوير والوثائق';
            if (str_contains($name, 'dashboard')) return 'عام';
            return 'أخرى';
        });

        return response()->json($grouped);
    }
}
