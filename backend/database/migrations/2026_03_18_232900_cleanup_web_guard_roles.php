<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Cleans up duplicate roles created with guard_name='web'.
     * Moves user-role assignments from web-guard roles to api-guard roles,
     * then removes the web-guard roles and any orphaned permissions.
     */
    public function up(): void
    {
        // Get all roles with guard_name = 'web'
        $webRoles = Role::where('guard_name', 'web')->get();

        foreach ($webRoles as $webRole) {
            // Find the corresponding api-guard role
            $apiRole = Role::where('name', $webRole->name)
                ->where('guard_name', 'api')
                ->first();

            if ($apiRole) {
                // Move all user-role assignments from web role to api role
                // Get users assigned to this web role
                $assignments = DB::table('model_has_roles')
                    ->where('role_id', $webRole->id)
                    ->get();

                foreach ($assignments as $assignment) {
                    // Check if user already has the api role
                    $exists = DB::table('model_has_roles')
                        ->where('role_id', $apiRole->id)
                        ->where('model_id', $assignment->model_id)
                        ->where('model_type', $assignment->model_type)
                        ->exists();

                    if (! $exists) {
                        // Assign the api-guard role
                        DB::table('model_has_roles')->insert([
                            'role_id' => $apiRole->id,
                            'model_id' => $assignment->model_id,
                            'model_type' => $assignment->model_type,
                        ]);
                    }
                }
            }

            // Remove all assignments for the web role
            DB::table('model_has_roles')->where('role_id', $webRole->id)->delete();

            // Remove role-permission assignments for the web role
            DB::table('role_has_permissions')->where('role_id', $webRole->id)->delete();

            // Delete the web-guard role itself
            DB::table('roles')->where('id', $webRole->id)->delete();
        }

        // Also clean up any permissions with guard_name='web' that shouldn't exist
        DB::table('permissions')->where('guard_name', 'web')->delete();

        // Clear the Spatie permission cache
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot reliably reverse this migration
    }
};
