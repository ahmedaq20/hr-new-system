<?php

use Illuminate\Support\Facades\Route;
use Modules\CoreModule\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use Modules\CoreModule\Http\Controllers\Auth\LoginController;
use Modules\CoreModule\Http\Controllers\Employee\DashboardController as EmployeeDashboardController;
use Modules\CoreModule\Http\Controllers\Admin\UserController;
use Modules\CoreModule\Http\Controllers\Admin\RoleController;
use Modules\CoreModule\Http\Controllers\Admin\PermissionController;

// Authentication Routes (no middleware needed for login as it returns JSON)
Route::prefix('v1')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);
});

Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::post('logout', [LoginController::class, 'logout'])->name('logout');

    // Admin Dashboard
    Route::middleware('permission:access-admin-dashboard')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    });

    // Employee Dashboard
    Route::get('/employee/dashboard', [EmployeeDashboardController::class, 'index'])->name('employee.dashboard');
    Route::get('/employee/payslips', [\Modules\CoreModule\Http\Controllers\Employee\PayslipController::class, 'index'])->name('employee.payslips.index');
    Route::get('/employee/payslips/{id}/download', [\Modules\CoreModule\Http\Controllers\Employee\PayslipController::class, 'download'])->name('employee.payslips.download');
    Route::get('/employee/payslip', [\Modules\CoreModule\Http\Controllers\Employee\PayslipController::class, 'show'])->name('employee.payslip');
    Route::post('/employee/profile-photo', [\Modules\CoreModule\Http\Controllers\Employee\ProfileController::class, 'updatePhoto']);
    Route::post('/employee/update-password', [\Modules\CoreModule\Http\Controllers\Employee\ProfileController::class, 'updatePassword']);
    Route::post('/employee/profile-update-request', [\Modules\CoreModule\Http\Controllers\Employee\ProfileUpdateRequestController::class, 'store']);

    // Admin Specific Profile Requests
    Route::middleware('permission:access-admin-dashboard')->prefix('admin')->group(function () {
        Route::get('/profile-update-requests', [\Modules\CoreModule\Http\Controllers\Employee\ProfileUpdateRequestController::class, 'index']);
        Route::post('/profile-update-requests/{id}/approve', [\Modules\CoreModule\Http\Controllers\Employee\ProfileUpdateRequestController::class, 'approve']);
        Route::post('/profile-update-requests/{id}/reject', [\Modules\CoreModule\Http\Controllers\Employee\ProfileUpdateRequestController::class, 'reject']);

        // Approval Archive
        Route::get('/approval-archive', [\Modules\CoreModule\Http\Controllers\Admin\ApprovalArchiveController::class, 'index']);
        Route::get('/approval-archive/employees', [\Modules\CoreModule\Http\Controllers\Admin\ApprovalArchiveController::class, 'employees']);

        // User Management — requires manage-users permission
        Route::middleware('permission:manage-users')->group(function () {
            Route::apiResource('users', UserController::class);
            Route::get('roles-list', [UserController::class, 'getRoles']);
        });

        // Role & Permission Management — requires manage-roles permission
        Route::middleware('permission:manage-roles')->group(function () {
            Route::apiResource('roles', RoleController::class);
            Route::get('permissions-list', [PermissionController::class, 'index']);
        });
    });

    // Employee Family Spouses
    Route::get('/employee/spouses', [\App\Http\Controllers\Employee\Family\EmployeeSpouseController::class, 'indexForAuthenticatedEmployee']);
    Route::post('/employee/spouses', [\App\Http\Controllers\Employee\Family\EmployeeSpouseController::class, 'storeForAuthenticatedEmployee']);
    Route::post('/employee/spouses/{id}', [\App\Http\Controllers\Employee\Family\EmployeeSpouseController::class, 'updateForAuthenticatedEmployee']);
    Route::delete('/employee/spouses/{id}', [\App\Http\Controllers\Employee\Family\EmployeeSpouseController::class, 'destroyForAuthenticatedEmployee']);

    // Employee Family Children
    Route::get('/employee/children', [\App\Http\Controllers\Employee\Family\EmployeeChildController::class, 'indexForAuthenticatedEmployee']);
    Route::post('/employee/children', [\App\Http\Controllers\Employee\Family\EmployeeChildController::class, 'storeForAuthenticatedEmployee']);
    Route::post('/employee/children/{id}', [\App\Http\Controllers\Employee\Family\EmployeeChildController::class, 'updateForAuthenticatedEmployee']);
    Route::delete('/employee/children/{id}', [\App\Http\Controllers\Employee\Family\EmployeeChildController::class, 'destroyForAuthenticatedEmployee']);
    // Employee Family Dependents
    Route::get('/employee/dependents', [\App\Http\Controllers\Employee\Family\EmployeeDependentController::class, 'indexForAuthenticatedEmployee']);
    Route::post('/employee/dependents', [\App\Http\Controllers\Employee\Family\EmployeeDependentController::class, 'storeForAuthenticatedEmployee']);
    Route::post('/employee/dependents/{id}', [\App\Http\Controllers\Employee\Family\EmployeeDependentController::class, 'updateForAuthenticatedEmployee']);
    Route::delete('/employee/dependents/{id}', [\App\Http\Controllers\Employee\Family\EmployeeDependentController::class, 'destroyForAuthenticatedEmployee']);
});
