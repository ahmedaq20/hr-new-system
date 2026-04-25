<?php

use App\Http\Controllers\Contract\ContractEmployeeController;
use App\Http\Controllers\Contract\TempContract\TempContractEmployeeController;
use App\Http\Controllers\Contract\TempContract\TempContractProjectController;
use App\Http\Controllers\Employee\Family\EmployeeChildController;
use App\Http\Controllers\Employee\Family\EmployeeDependentController;
use App\Http\Controllers\Employee\RetireesController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect('/api/v1/login');
});

Route::prefix('v1')->middleware(['auth:sanctum', 'permission:access-admin-dashboard'])->group(function () {

    /* =========================
     |  Employees
     ========================= */
    Route::post('/employees/find_governorate', [\App\Http\Controllers\Employee\EmployeeController::class, 'find_governorate'])->name('employees.find_governorate');

    Route::apiResource('employees', \App\Http\Controllers\Employee\EmployeeController::class);

    Route::post('/employees/find_governorate', [\App\Http\Controllers\Employee\EmployeeController::class, 'find_governorate']);

    Route::get('employees/{employee}/children', [EmployeeChildController::class, 'indexForEmployee']);
    Route::get('employees/{employee}/dependents', [EmployeeDependentController::class, 'indexForEmployee']);

    /* =========================
     |  Children
     ========================= */

    // Soft Deletes (قبل resource)
    Route::get('children/deleted', [EmployeeChildController::class, 'showDeletedChildren']);
    Route::get('children/with-deleted', [EmployeeChildController::class, 'showAllWithDeleted']);
    Route::post('children/{child}/restore', [EmployeeChildController::class, 'restore']);

    Route::apiResource('children', EmployeeChildController::class);

    /* =========================
     |  Dependents
     ========================= */

    Route::get('dependents/deleted', [EmployeeDependentController::class, 'showDeleted']);
    Route::get('dependents/with-deleted', [EmployeeDependentController::class, 'showWithDeleted']);
    Route::post('dependents/{dependent}/restore', [EmployeeDependentController::class, 'restore']);

    Route::apiResource('dependents', EmployeeDependentController::class);

    /* =========================
     |  Contracts & Others
     ========================= */

    Route::get('contracts/{contractType}', [ContractEmployeeController::class, 'index']);

    Route::apiResource('temp-contract-employees', TempContractEmployeeController::class)
        ->parameters(['temp-contract-employees' => 'tempContractEmployee']);

    Route::apiResource('temp-contract-projects', TempContractProjectController::class)
        ->parameters(['temp-contract-projects' => 'tempContractProject']);

    Route::get('retirees', [RetireesController::class, 'index']);

    /* =========================
     |  Payslips
     ========================= */
    Route::get('payslips/{payslip}/download', [\App\Http\Controllers\Finance\PayslipController::class, 'download'])
        ->name('payslips.download');

    /* =========================
     |  Employee Documents
     ========================= */
    Route::get('academic-documents', [\App\Http\Controllers\Document\EmployeeDocumentController::class, 'index'])->name('employee-documents.academic.index');
    Route::post('academic-documents', [\App\Http\Controllers\Document\EmployeeDocumentController::class, 'store'])->name('employee-documents.academic.store');
    Route::get('academic-documents/{employeeDocument}/download', [\App\Http\Controllers\Document\EmployeeDocumentController::class, 'download'])->name('employee-documents.academic.download');

    Route::get('administrative-documents', [\App\Http\Controllers\Document\EmployeeDocumentController::class, 'index'])->name('employee-documents.administrative.index');
    Route::post('administrative-documents', [\App\Http\Controllers\Document\EmployeeDocumentController::class, 'store'])->name('employee-documents.administrative.store');
    Route::get('administrative-documents/{employeeDocument}/download', [\App\Http\Controllers\Document\EmployeeDocumentController::class, 'download'])->name('employee-documents.administrative.download');

    Route::put('employee-documents/{employeeDocument}/status', [\App\Http\Controllers\Document\EmployeeDocumentController::class, 'updateStatus'])->name('employee-documents.update-status');
    Route::delete('employee-documents/{employeeDocument}', [\App\Http\Controllers\Document\EmployeeDocumentController::class, 'destroy'])->name('employee-documents.destroy');
    
    /* =========================
     |  Training
     ========================= */
    Route::get('training-courses/data', [\App\Http\Controllers\Training\TrainingCourseController::class, 'data'])->name('training-courses.data');
    Route::get('training-courses/employees/search', [\App\Http\Controllers\Training\TrainingCourseController::class, 'searchEmployees']);
    Route::get('training-courses/participants/all', [\App\Http\Controllers\Training\TrainingCourseController::class, 'allParticipants']);
    Route::get('admin/training-participants', [\App\Http\Controllers\Training\TrainingCourseController::class, 'adminParticipantsList']);
    Route::post('training-courses/{training_course}/participants', [\App\Http\Controllers\Training\TrainingCourseController::class, 'addParticipant']);
    Route::delete('training-courses/{training_course}/participants/{participant}', [\App\Http\Controllers\Training\TrainingCourseController::class, 'removeParticipant']);
    Route::post('training-courses/participants/{participant}/approve', [\App\Http\Controllers\Training\TrainingCourseController::class, 'approveParticipant']);
    Route::post('training-courses/participants/{participant}/reject', [\App\Http\Controllers\Training\TrainingCourseController::class, 'rejectParticipant']);

    Route::post('training-courses/{training_course}/supervisors', [\App\Http\Controllers\Training\TrainingCourseController::class, 'addSupervisor']);
    Route::delete('training-courses/{training_course}/supervisors/{supervisor}', [\App\Http\Controllers\Training\TrainingCourseController::class, 'removeSupervisor']);
    
    // Attachments & Photos & Certificates
    Route::get('training-courses/{training_course}/attachments', [\App\Http\Controllers\Training\TrainingAttachmentController::class, 'attachments']);
    Route::post('training-courses/{training_course}/attachments', [\App\Http\Controllers\Training\TrainingAttachmentController::class, 'storeAttachment']);
    Route::delete('training-courses/{training_course}/attachments/{attachment}', [\App\Http\Controllers\Training\TrainingAttachmentController::class, 'deleteAttachment']);
    
    Route::get('training-courses/{training_course}/photos', [\App\Http\Controllers\Training\TrainingAttachmentController::class, 'photos']);
    Route::post('training-courses/{training_course}/photos', [\App\Http\Controllers\Training\TrainingAttachmentController::class, 'storePhoto']);
    Route::delete('training-courses/{training_course}/photos/{photo}', [\App\Http\Controllers\Training\TrainingAttachmentController::class, 'deletePhoto']);
    
    Route::get('training-courses/{training_course}/certificates', [\App\Http\Controllers\Training\TrainingAttachmentController::class, 'certificates']);
    Route::post('training-courses/{training_course}/certificates', [\App\Http\Controllers\Training\TrainingAttachmentController::class, 'storeCertificate']);
    Route::delete('training-courses/{training_course}/certificates/{certificate}', [\App\Http\Controllers\Training\TrainingAttachmentController::class, 'deleteCertificate']);

    // Attendance Routes
    Route::get('training-courses/{training_course}/attendance', [\App\Http\Controllers\Training\TrainingAttendanceController::class, 'data']);
    Route::post('training-courses/{training_course}/attendance', [\App\Http\Controllers\Training\TrainingAttendanceController::class, 'store']);
    Route::put('training-courses/{training_course}/attendance/{attendance}', [\App\Http\Controllers\Training\TrainingAttendanceController::class, 'update']);
    Route::get('training-courses/{training_course}/attendance/template', [\App\Http\Controllers\Training\TrainingAttendanceController::class, 'template']);
    Route::post('training-courses/{training_course}/attendance/import', [\App\Http\Controllers\Training\TrainingAttendanceController::class, 'import']);
    Route::get('training-courses/{training_course}/attendance/export', [\App\Http\Controllers\Training\TrainingAttendanceController::class, 'export']);

    Route::apiResource('training-courses', \App\Http\Controllers\Training\TrainingCourseController::class)
        ->parameters(['training-courses' => 'training_course']);

});

// General Auth Routes for Employees
Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    /* =========================
     |  Training (Employee Access)
     ========================= */
    Route::get('training-courses/data', [\App\Http\Controllers\Training\TrainingCourseController::class, 'data']);
    Route::get('training-courses/{training_course}', [\App\Http\Controllers\Training\TrainingCourseController::class, 'show']);
    Route::post('training-courses/{training_course}/request-registration', [\App\Http\Controllers\Training\TrainingCourseController::class, 'requestRegistration']);
    Route::post('training-courses/request-registration-manual', [\App\Http\Controllers\Training\TrainingCourseController::class, 'requestRegistration']);
    Route::put('training-courses/participants/{participant}', [\App\Http\Controllers\Training\TrainingCourseController::class, 'updateRegistration']);
    Route::delete('training-courses/participants/{participant}', [\App\Http\Controllers\Training\TrainingCourseController::class, 'deleteRegistration']);
});

Route::fallback(function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect('/api/v1/login');
});
