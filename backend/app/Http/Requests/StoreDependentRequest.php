<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDependentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'exists:employees,id'],
            'full_name'   => ['required', 'string', 'max:255'],
            'birth_date'  => ['required', 'date'],
            'gender' => ['required', 'in:ذكر,أنثى'],
            'dependency_proof' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'employee_id.required' => 'رقم الموظف مطلوب.',
            'employee_id.exists'   => 'الموظف غير موجود في النظام.',

            'full_name.required' => 'الاسم الكامل مطلوب.',
            'full_name.string'   => 'الاسم الكامل يجب أن يكون نصًا.',
            'full_name.max'      => 'الاسم الكامل طويل جدًا.',

            'birth_date.required' => 'تاريخ الميلاد مطلوب.',
            'birth_date.date'     => 'تاريخ الميلاد غير صحيح.',

            'gender.required' => 'الجنس مطلوب.',
            'gender.in'       => 'الجنس يجب أن يكون ذكر أو أنثى.',

            'dependency_proof.file'  => 'ملف الإثبات غير صالح.',
            'dependency_proof.mimes' => 'ملف الإثبات يجب أن يكون PDF أو صورة.',
            'dependency_proof.max'   => 'حجم ملف الإثبات يجب ألا يتجاوز 2 ميغابايت.',
        ];
    }
}
