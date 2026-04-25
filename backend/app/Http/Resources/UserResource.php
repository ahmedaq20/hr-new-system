<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->national_id,
            "name" => $this->name,
            'national_id' => $this->national_id,
            "email"  => $this->email, // Fixed to use actual email if available, or national_id
            "email_verified_at" => $this->email_verified_at,
            "token" => $this->token,
            "permissions" => $this->hasRole('super admin', 'api') 
                ? \Spatie\Permission\Models\Permission::pluck('name') 
                : $this->getAllPermissions()->pluck('name'),
            "is_admin" => $this->hasPermissionTo('access-admin-dashboard', 'api') || $this->hasRole('admin', 'api') || $this->hasRole('super admin', 'api'),
            "roles" => $this->getRoleNames(),
            "profile_photo_url" => $this->profile_photo_url,
        ];
    }
}
