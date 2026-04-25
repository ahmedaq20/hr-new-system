<?php

use Illuminate\Support\Facades\Route;
use Modules\FamilyModule\Http\Controllers\Admin\EmployeeChildController;
use Modules\FamilyModule\Http\Controllers\Admin\EmployeeDependentController;
use Modules\FamilyModule\Http\Controllers\Admin\EmployeeSpouseController;

Route::prefix('v1/employees')
    ->name('employees.')
    ->group(function () {
        Route::middleware(['auth:sanctum', 'permission:manage-profile-requests'])->group(function () {
            // Family (Admin view)
            Route::get('spouses/data', [EmployeeSpouseController::class, 'data'])->name('spouses.data');
            Route::get('spouses', [EmployeeSpouseController::class, 'index'])->name('spouses.index');
            Route::post('spouses/{id}/approve', [EmployeeSpouseController::class, 'approve'])->name('spouses.approve');
            Route::post('spouses/{id}/reject', [EmployeeSpouseController::class, 'reject'])->name('spouses.reject');

            Route::get('children/data', [EmployeeChildController::class, 'data'])->name('children.data');
            Route::get('children', [EmployeeChildController::class, 'index'])->name('children.index');
            Route::post('children/{id}/approve', [EmployeeChildController::class, 'approve'])->name('children.approve');
            Route::post('children/{id}/reject', [EmployeeChildController::class, 'reject'])->name('children.reject');

            Route::get('dependents/data', [EmployeeDependentController::class, 'data'])->name('dependents.data');
            Route::get('dependents', [EmployeeDependentController::class, 'index'])->name('dependents.index');
            Route::post('dependents/{id}/approve', [EmployeeDependentController::class, 'approve'])->name('dependents.approve');
            Route::post('dependents/{id}/reject', [EmployeeDependentController::class, 'reject'])->name('dependents.reject');
        });
    });
