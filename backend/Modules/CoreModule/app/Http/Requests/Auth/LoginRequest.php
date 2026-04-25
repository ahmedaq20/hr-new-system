<?php

namespace Modules\CoreModule\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'national_id' => ['required', 'string', 'max:9'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'national_id.required' => 'حقل الرقم القومي أو اسم المستخدم مطلوب.',
            'national_id.string' => 'يجب أن يكون الرقم القومي أو اسم المستخدم نصاً صالحاً.',
            'national_id.max' => 'يجب ألا يزيد الرقم القومي أو اسم المستخدم عن 9 أحرف.',
            'password.required' => 'حقل كلمة المرور مطلوب.',
            'password.string' => 'يجب أن تكون كلمة المرور نصاً صالحاً.',
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $nationalId = $this->input('national_id');
        $password = $this->input('password');
        $remember = $this->boolean('remember');

        // 1. Try traditional Laravel authentication first (for admins/users with hashed passwords)
        if (
            Auth::attempt(['national_id' => $nationalId, 'password' => $password], $remember) ||
            Auth::attempt(['name' => $nationalId, 'password' => $password], $remember)
        ) {
            RateLimiter::clear($this->throttleKey());
            return;
        }

        // 2. If traditional failed, check if it's an employee using national_id as username and employee_number as password
        $user = \App\Models\User::where('national_id', $nationalId)->orWhere('name', $nationalId)->first();

        if ($user && $user->hasRole('employee')) {
            $employee = $user->employee;
            if ($employee) {
                $employeeNumber = $employee->employee_number;
                $birthDatePassword = $employee->birth_date ? $employee->birth_date->format('Ymd') : null;

                if (($employeeNumber && $employeeNumber === $password) || ($birthDatePassword && $birthDatePassword === $password)) {
                    Auth::login($user, $remember);
                    RateLimiter::clear($this->throttleKey());
                    return;
                }
            }
        }

        // 3. Fallback to failure
        RateLimiter::hit($this->throttleKey());

        throw new HttpResponseException(response()->json([
            'message' => __('رقم الهوية أو كلمة المرور غير صحيحة'),
            'errors' => [
                'national_id' => [__('رقم الهوية أو كلمة المرور غير صحيحة')],
            ],
        ], 422));
    }



    /**
     * Ensure the login request is not rate limited.
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey());

        $message = trans('auth.throttle', [
            'seconds' => $seconds,
            'minutes' => ceil($seconds / 60),
        ]);

        throw new HttpResponseException(response()->json([
            'message' => $message,
            'errors' => [
                'national_id' => [$message],
            ],
        ], 429));
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return strtolower($this->input('national_id')).'|'.$this->ip();
    }

    /**
     * Always return JSON validation errors for this API request.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => $validator->errors()->first() ?: 'The given data was invalid.',
            'errors' => $validator->errors()->toArray(),
        ], 422));
    }
}
