<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TempContractProjectRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'duration' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'funding_source' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'اسم المشروع',
            'duration' => 'مدة المشروع',
            'start_date' => 'تاريخ بداية المشروع',
            'end_date' => 'تاريخ نهاية المشروع',
            'funding_source' => 'الجهة الممولة',
            'description' => 'وصف المشروع',
        ];
    }
}
