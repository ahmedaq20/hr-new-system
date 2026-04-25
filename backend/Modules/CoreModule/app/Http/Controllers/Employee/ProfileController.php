<?php

namespace Modules\CoreModule\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Update the authenticated user's profile photo.
     */
    public function updatePhoto(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'profile_photo' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:2048'], // Max 2MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('profile_photo')) {
            // Delete old photo if it exists
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }

            // Store new photo
            $file = $request->file('profile_photo');
            $path = $file->store('profile_photos', 'public');

            // Update user record
            $user->update([
                'profile_photo' => $path
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث الصورة الشخصية بنجاح.',
                'photo_url' => Storage::disk('public')->url($path)
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'لم يتم العثور على ملف مرفوع.'
        ], 400);
    }

    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'current_password.required' => 'كلمة المرور الحالية مطلوبة.',
            'new_password.required' => 'كلمة المرور الجديدة مطلوبة.',
            'new_password.min' => 'كلمة المرور الجديدة يجب أن لا تقل عن 8 أحرف.',
            'new_password.confirmed' => 'تأكيد كلمة المرور غير متطابق.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'كلمة المرور الحالية غير صحيحة.'
            ], 422);
        }

        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث كلمة المرور بنجاح.'
        ]);
    }
}
