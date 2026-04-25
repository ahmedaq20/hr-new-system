<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find or create the super admin role
        $role = Role::firstOrCreate(['name' => 'super admin', 'guard_name' => 'api']);

        // Check if user exists by national_id or id
        $user = User::where('national_id', '=', '90000001')
            ->orWhere('id', '=', 90000009)
            ->first();

        if (! $user) {
            // Create user
            $user = new User();
            $user->id = 90000009;
            $user->name = 'SuperHr26';
            $user->national_id = '90000009';
            $user->email = 'superadmin2026@mne-ps.com';
            $user->password = Hash::make('SuperHrAdmin@2026');
            $user->save();
            
            $this->command->info('Super Admin user created.');
        } else {
            // Update user
            $user->update([
                'id' => 90000009,
                'name' => 'SuperHr26',
                'national_id' => '90000001',
                'email' => 'superadmin2026@mne-ps.com',
                'password' => Hash::make('SuperHrAdmin@2026'),
            ]);
            $this->command->info('Super Admin user updated.');
        }

        // Assign role
        if (! $user->hasRole('super admin')) {
            $user->assignRole($role);
            $this->command->info('Assigned super admin role to user.');
        } else {
            $this->command->info('User already has super admin role.');
        }
    }
}
