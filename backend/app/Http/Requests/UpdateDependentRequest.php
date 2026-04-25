<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
class UpdateDependentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name'  => ['sometimes', 'string', 'max:255'],
            'birth_date' => ['sometimes', 'date'],
            'gender'     => ['sometimes', 'in:male,female'],
            'dependency_proof' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.string' => 'الاسم الكامل يجب أن يكون نصًا.',
            'full_name.max'    => 'الاسم الكامل طويل جدًا.',

            'birth_date.date' => 'تاريخ الميلاد غير صحيح.',

            'gender.in' => 'الجنس يجب أن يكون ذكر أو أنثى.',

            'dependency_proof.file'  => 'ملف الإثبات غير صالح.',
            'dependency_proof.mimes' => 'ملف الإثبات يجب أن يكون PDF أو صورة.',
            'dependency_proof.max'   => 'حجم ملف الإثبات يجب ألا يتجاوز 2 ميغابايت.',
        ];
    }
}
