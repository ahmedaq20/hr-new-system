<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'employee_id' => ['required', 'exists:employees,id'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];

        // For academic certificates, reference_value_id is required
        if ($this->input('is_academic') == '1') {
            $rules['reference_value_id'] = ['required', 'exists:reference_data,id'];
        } else {
            $rules['reference_value_id'] = ['nullable', 'exists:reference_data,id'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'employee_id.required' => 'الموظف مطلوب',
            'employee_id.exists' => 'الموظف المحدد غير موجود',
            'reference_value_id.required' => 'القيمة المرجعية مطلوبة',
            'reference_value_id.exists' => 'القيمة المرجعية المحددة غير موجودة',
            'file.required' => 'الملف مطلوب',
            'file.file' => 'يجب أن يكون الملف ملفاً صحيحاً',
            'file.mimes' => 'يجب أن يكون الملف من نوع PDF أو صورة',
            'file.max' => 'حجم الملف يجب أن يكون أقل من 5 ميجابايت',
            'notes.max' => 'الملاحظات يجب أن تكون أقل من 1000 حرف',
        ];
    }
}
