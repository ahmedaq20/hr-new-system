<?php

use App\Models\Employee;
use App\Models\ReferenceData;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates user accounts for all employees who are:
     * - على رأس عمله (active employment status)
     * - رسمي (official) OR عقد تشغيل (contract) employment type
     */
    public function up(): void
    {
        // Get the employment_status_id for "على رأس عمله" using slug
        $activeStatusId = ReferenceData::where('name', 'EMPLOYMENT_STATUS')
            ->where('slug', 'employment_status.active')
            ->value('id');

        // Get the employment_type_ids for "رسمي" OR "عقد تشغيل" using slugs
        $eligibleTypeIds = ReferenceData::where('name', 'EMPLOYMENT_TYPE')
            ->whereIn('slug', ['employment_type.official', 'employment_type.contract'])
            ->pluck('id')
            ->toArray();

        if (! $activeStatusId || empty($eligibleTypeIds)) {
            // Skip if reference data is not set up
            return;
        }

        // Get or create the employee role
        $employeeRole = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'api']);

        // Find all eligible employees (على رأس عمله & (رسمي OR عقد تشغيل))
        $eligibleEmployees = Employee::query()
            ->whereHas('workDetail', function ($query) use ($activeStatusId, $eligibleTypeIds) {
                $query->where('employment_status_id', $activeStatusId)
                    ->whereIn('employment_type_id', $eligibleTypeIds);
            })
            ->whereNotNull('national_id')
            ->whereNull('user_id')
            ->get();

        foreach ($eligibleEmployees as $employee) {
            // Skip if a user with this national_id already exists
            $existingUser = User::where('national_id', $employee->national_id)->first();

            if ($existingUser) {
                // Link the existing user to the employee
                $employee->update(['user_id' => $existingUser->id]);

                continue;
            }

            // Create a new user for the employee
            $user = User::create([
                'name' => $employee->full_name,
                'national_id' => $employee->national_id,
                'email' => $employee->national_id.'@employee.local',
                'password' => Hash::make('password'),
            ]);

            // Assign employee role
            $user->assignRole($employeeRole);

            // Link the user to the employee
            $employee->update(['user_id' => $user->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Get all users that were created for employees (with @employee.local email)
        $employeeUsers = User::where('email', 'like', '%@employee.local')->get();

        foreach ($employeeUsers as $user) {
            // Unlink employee from user
            Employee::where('user_id', $user->id)->update(['user_id' => null]);

            // Delete the user
            $user->delete();
        }
    }
};
