<?php

namespace Modules\CoreModule\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\ProfileUpdateRequest;
use App\Models\EmployeeSpouse;
use App\Models\EmployeeChild;
use App\Models\EmployeeDependent;
use Modules\EmployeeDegree\Models\EmployeeDegree;
use App\Models\TrainingParticipant;
use App\Models\Employee;

class ApprovalArchiveController extends Controller
{
    /**
     * Get paginated archive records using a UNION query for performance.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $employeeId = $request->input('employee_id');

        // Create base queries for each table
        $queries = [];

        // 1. Profile Update Requests
        $q1 = DB::table('profile_update_requests')
            ->select('id', 'employee_id', 'status as approval_status', 'approved_by', 'approved_at', 'rejection_reason', DB::raw("'profile' as _type"), 'created_at as sort_date')
            ->whereNotNull('status')->where('status', '!=', 'pending');
            
        // 2. Spouses
        $q2 = DB::table('employee_spouses')
            ->select('id', 'employee_id', 'approval_status', 'approved_by', 'approved_at', 'rejection_reason', DB::raw("'spouse' as _type"), 'created_at as sort_date')
            ->whereNotNull('approval_status')->where('approval_status', '!=', 'pending');

        // 3. Children
        $q3 = DB::table('employee_children')
            ->select('id', 'employee_id', 'approval_status', 'approved_by', 'approved_at', 'rejection_reason', DB::raw("'child' as _type"), 'created_at as sort_date')
            ->whereNotNull('approval_status')->where('approval_status', '!=', 'pending');

        // 4. Dependents
        $q4 = DB::table('employee_dependents')
            ->select('id', 'employee_id', 'approval_status', 'approved_by', 'approved_at', 'rejection_reason', DB::raw("'dependent' as _type"), 'created_at as sort_date')
            ->whereNotNull('approval_status')->where('approval_status', '!=', 'pending');

        // 5. Degrees (Qualifications)
        $q5 = DB::table('employee_degrees')
            ->select('id', 'employee_id', 'approval_status', 'approved_by', 'approved_at', 'rejection_reason', DB::raw("'qualification' as _type"), 'created_at as sort_date')
            ->whereNotNull('approval_status')->where('approval_status', '!=', 'pending')
            ->whereNull('deleted_at');

        // 6. Training Participants (Courses)
        $q6 = DB::table('training_participants')
            ->select('id', 'employee_id', 'approval_status', 'approved_by', 'approved_at', 'rejection_reason', DB::raw("'course' as _type"), 'created_at as sort_date')
            ->whereNotNull('approval_status')->where('approval_status', '!=', 'pending');

        // Apply employee filter if provided
        if ($employeeId) {
            $q1->where('employee_id', $employeeId);
            $q2->where('employee_id', $employeeId);
            $q3->where('employee_id', $employeeId);
            $q4->where('employee_id', $employeeId);
            $q5->where('employee_id', $employeeId);
            $q6->where('employee_id', $employeeId);
        }

        // Combine queries
        $unionQuery = $q1->unionAll($q2)->unionAll($q3)->unionAll($q4)->unionAll($q5)->unionAll($q6);

        // Wrap the union query so we can order and paginate
        $archiveQuery = DB::query()
            ->fromSub($unionQuery, 'archive_logs')
            ->orderByDesc('approved_at')
            ->orderByDesc('sort_date');

        $paginatedRecords = $archiveQuery->paginate($perPage);

        // Enhance the items with Eloquent Models
        $items = collect($paginatedRecords->items())->map(function ($record) {
            $model = null;
            switch ($record->_type) {
                case 'profile':
                    $model = ProfileUpdateRequest::with(['employee.user', 'approver'])->find($record->id);
                    break;
                case 'spouse':
                    $model = EmployeeSpouse::with(['employee.user', 'approver'])->find($record->id);
                    break;
                case 'child':
                    $model = EmployeeChild::with(['employee.user', 'approver'])->find($record->id);
                    break;
                case 'dependent':
                    $model = EmployeeDependent::with(['employee.user', 'approver'])->find($record->id);
                    break;
                case 'qualification':
                    $model = EmployeeDegree::with(['employee.user', 'approver', 'qualification'])->find($record->id);
                    break;
                case 'course':
                    $model = TrainingParticipant::with(['employee.user', 'approver', 'trainingCourse'])->find($record->id);
                    break;
            }

            if ($model) {
                $model->_type = $record->_type;
                if ($record->_type === 'profile') {
                    $model->approval_status = $model->status;
                }
                $model->approved_by_name = $model->approver?->name;
                return $model;
            }
            return null;
        })->filter();

        // Overwrite the simple items with the full Eloquent items
        $collection = $paginatedRecords->setCollection($items->values());

        return response()->json([
            'success' => true,
            'data' => $collection
        ]);
    }

    /**
     * Get a list of employees who have records in the archive.
     */
    public function employees()
    {
        // Simple distinct query for performance
        $employeeIds = DB::table('profile_update_requests')->where('status', '!=', 'pending')->select('employee_id')
            ->union(DB::table('employee_spouses')->where('approval_status', '!=', 'pending')->select('employee_id'))
            ->union(DB::table('employee_children')->where('approval_status', '!=', 'pending')->select('employee_id'))
            ->union(DB::table('employee_dependents')->where('approval_status', '!=', 'pending')->select('employee_id'))
            ->union(DB::table('employee_degrees')->where('approval_status', '!=', 'pending')->select('employee_id'))
            ->union(DB::table('training_participants')->where('approval_status', '!=', 'pending')->select('employee_id'))
            ->pluck('employee_id')
            ->unique()
            ->filter();
            
        $employees = Employee::whereIn('id', $employeeIds)
            ->with('user')
            ->get()
            ->map(function ($emp) {
                return [
                    'value' => $emp->id,
                    'label' => $emp->user ? $emp->user->name : ($emp->first_name . ' ' . $emp->last_name)
                ];
            })
            ->sortBy('label')
            ->values();
            
        return response()->json([
            'success' => true,
            'data' => $employees
        ]);
    }
}
