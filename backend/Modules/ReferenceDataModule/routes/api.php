<?php

use Illuminate\Support\Facades\Route;
use Modules\ReferenceDataModule\Http\Controllers\ReferenceDataController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::get('reference-data', [ReferenceDataController::class, 'index']);

    Route::middleware('permission:manage-system-lookups')->group(function () {
        Route::apiResource('reference-data', ReferenceDataController::class)->except(['index'])->parameters([
            'reference-data' => 'referenceData',
        ]);
    });
});
