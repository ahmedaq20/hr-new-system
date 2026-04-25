<?php

use Illuminate\Support\Facades\Route;
use Modules\EmployeeDegree\Http\Controllers\EmployeeDegreeController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('employeedegrees', EmployeeDegreeController::class)->names('employeedegree');
});
