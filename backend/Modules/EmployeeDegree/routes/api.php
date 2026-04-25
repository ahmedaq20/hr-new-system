<?php

use Illuminate\Support\Facades\Route;
use Modules\EmployeeDegree\Http\Controllers\EmployeeDegreeController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::prefix('employee-degrees')->group(function () {
        // Public (Auth) routes
        Route::get('/employee/{employeeId}', [EmployeeDegreeController::class, 'employeeIdDegree']);
        Route::post('/', [EmployeeDegreeController::class, 'store']);
        Route::put('/{employeeDegree}', [EmployeeDegreeController::class, 'update']);
        Route::delete('/{employeeDegree}', [EmployeeDegreeController::class, 'delete']);

        // Admin only routes
        Route::middleware('permission:manage-profile-requests')->group(function () {
            Route::get('/deleted', [EmployeeDegreeController::class, 'showAllDeleted']);
            Route::get('/all', [EmployeeDegreeController::class, 'showAllWithDeleted']);
            Route::get('/{id}', [EmployeeDegreeController::class, 'show']);
            Route::post('/{employeeDegree}/approve', [EmployeeDegreeController::class, 'approve']);
            Route::post('/{employeeDegree}/reject', [EmployeeDegreeController::class, 'reject']);
            Route::post('/restore/{id}', [EmployeeDegreeController::class, 'restore']);
        });
    });
});
