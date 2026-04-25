<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Dashboard
            'access-admin-dashboard',

            // Employee permissions (Self-service)
            'view-own-salary-slip',
            'download-salary-slip',

            // Employee management (Admin)
            'view-employees',
            'create-employees',
            'edit-employees',
            'delete-employees',
            'view-employee-archive',
            'manage-profile-requests',

            // Contracts and Programs
            'manage-employment-contracts',
            'manage-work-programs',

            // System data / lookups
            'manage-system-lookups', // Ministries, Departments, units, etc.
            'manage-employee-status',

            // Reports
            'view-reports',
            'export-reports',

            // Financials
            'manage-allowances-deductions',
            'manage-payslips',

            // Training
            'manage-training-catalog',
            'view-attendance-records',

            // System administration
            'manage-users',
            'manage-roles',
            'manage-permissions',
            'manage-settings',
            'view-logs',
            'delete-records',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'api'
            ]);
        }

        // Clear cache after creating permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles and assign permissions

        // 1. Super Admin Role
        $adminRole = Role::firstOrCreate(['name' => 'super admin', 'guard_name' => 'api']);
        $adminRole->syncPermissions(Permission::where('guard_name', 'api')->get());

        // 2. Employee Role
        $employeeRole = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'api']);
        $employeeRole->syncPermissions([
            'view-own-salary-slip',
            'download-salary-slip',
        ]);

        // 3. Officer Role
        $officerRole = Role::firstOrCreate(['name' => 'officer', 'guard_name' => 'api']);
        $officerRole->syncPermissions([
            'access-admin-dashboard',
            'view-employees',
            'create-employees',
            'edit-employees',
            'manage-employee-status',
            'manage-system-lookups',
            'view-reports',
            'manage-profile-requests',
        ]);

        // 4. Director Role
        $directorRole = Role::firstOrCreate(['name' => 'director', 'guard_name' => 'api']);
        $directorRole->syncPermissions([
            'access-admin-dashboard',
            'view-employees',
            'view-reports',
            'export-reports',
            'view-logs',
        ]);


    }
}
