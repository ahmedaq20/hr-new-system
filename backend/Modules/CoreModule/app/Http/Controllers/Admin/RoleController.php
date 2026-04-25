<?php

namespace Modules\CoreModule\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    /**
     * Display a listing of the roles with stats.
     */
    public function index(): JsonResponse
    {
        $roles = Role::where('guard_name', 'api')->withCount('permissions')->get();
        
        $stats = [
            'total_roles' => $roles->count(),
            'active_roles' => $roles->count(), // Can be refined if there's an active flag
            'distributed_permissions' => DB::table('role_has_permissions')->distinct('permission_id')->count(),
            'avg_permissions_per_role' => $roles->avg('permissions_count') ?? 0,
        ];

        return response()->json([
            'roles' => $roles,
            'stats' => $stats
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                \Illuminate\Validation\Rule::unique('roles', 'name')->where('guard_name', 'api')
            ],
            'permissions' => 'array',
        ]);

        $role = Role::create(['name' => $validated['name'], 'guard_name' => 'api']);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return response()->json($role, 201);
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role): JsonResponse
    {
        return response()->json($role->load('permissions'));
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                // Ensure name is unique for the 'api' guard, ignoring the current role
                \Illuminate\Validation\Rule::unique('roles', 'name')
                    ->where('guard_name', 'api')
                    ->ignore($role->id)
            ],
            'permissions' => 'array',
        ]);

        $role->update(['name' => $validated['name']]);

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return response()->json($role);
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role): JsonResponse
    {
        // Prevent deleting the super admin role
        if ($role->name === 'super admin') {
            return response()->json(['message' => 'لا يمكن حذف دور الـ Super Admin من النظام'], 403);
        }

        // Manually delete relations and the role using DB facade to prevent "Class name must be a valid object or a string" error
        // that occurs when Spatie's Role deleting event tries to resolve model relations on a broken cached config.
        // This bypasses the Eloquent `deleting` event completely.
        \Illuminate\Support\Facades\DB::table('model_has_roles')->where('role_id', $role->id)->delete();
        \Illuminate\Support\Facades\DB::table('role_has_permissions')->where('role_id', $role->id)->delete();
        \Illuminate\Support\Facades\DB::table('roles')->where('id', $role->id)->delete();
        
        // Clear Spatie permission cache
        app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
        
        return response()->json(['message' => 'Role deleted successfully']);
    }
}
