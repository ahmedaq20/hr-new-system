<?php

namespace Modules\CoreModule\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['roles', 'employee.workDetail']);

        // Filter by type (admin vs employee) based on role names
        if ($request->type === 'admin') {
            // Admin users have at least one role that isn't 'employee'
            $query->whereHas('roles', function($q) {
                $q->where('name', '!=', 'employee');
            });
        } elseif ($request->type === 'employee') {
            // Employee users have NO roles that aren't 'employee'
            $query->whereDoesntHave('roles', function($q) {
                $q->where('name', '!=', 'employee');
            });
        }

        // Search logic
        if ($request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%")
                  ->orWhere('national_id', 'like', "%{$searchTerm}%")
                  ->orWhereHas('employee', function($eq) use ($searchTerm) {
                      $eq->where('first_name', 'like', "%{$searchTerm}%")
                         ->orWhere('family_name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        $users = $query->paginate(15);
        
        return response()->json($users);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'national_id' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8',
            'roles' => 'array',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'national_id' => $validated['national_id'],
            'password' => bcrypt($validated['password']),
        ]);

        if (!empty($validated['roles'])) {
            $user->assignRole($validated['roles']);
        }

        return response()->json($user, 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): JsonResponse
    {
        // Load roles and related employee data with job title for the frontend details modal
        $user->load(['roles', 'employee.workDetail.jobTitle']);
        
        return response()->json($user);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        if ($user->hasRole('super admin') && !auth()->user()->hasRole('super admin')) {
            return response()->json(['message' => 'ليس لديك صلاحية لتعديل حساب الـ Super Admin'], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'string|email|max:255|unique:users,email,' . $user->id,
            'national_id' => 'string|max:255|unique:users,national_id,' . $user->id,
            'password' => 'nullable|string|min:8',
            'roles' => 'array',
        ]);

        $user->update(array_merge(
            $request->only(['name', 'email', 'national_id']),
            $request->password ? ['password' => bcrypt($request->password)] : []
        ));

        if (isset($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        return response()->json($user);
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): JsonResponse
    {
        if ($user->hasRole('super admin')) {
            return response()->json(['message' => 'لا يمكن حذف حساب الـ Super Admin من النظام'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Get all roles for assignment.
     */
    public function getRoles(): JsonResponse
    {
        $roles = Role::where('guard_name', 'api')->get();
        return response()->json($roles);
    }
}
