<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePayslipRequest extends FormRequest
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
            'year' => [
                'required',
                'integer',
                'min:2000',
                'max:'.(date('Y') + 1),
            ],
            'month' => [
                'required',
                'integer',
                'min:1',
                'max:12',
            ],
            'payslip_file' => [
                'required',
                'file',
                'mimes:pdf',
                'max:10240', // 10MB
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'year.required' => 'السنة مطلوبة',
            'year.integer' => 'السنة يجب أن تكون رقماً',
            'year.min' => 'السنة يجب أن تكون أكبر من أو تساوي 2000',
            'year.max' => 'السنة يجب أن تكون أقل من أو تساوي '.(date('Y') + 1),
            'month.required' => 'الشهر مطلوب',
            'month.integer' => 'الشهر يجب أن يكون رقماً',
            'month.min' => 'الشهر يجب أن يكون بين 1 و 12',
            'month.max' => 'الشهر يجب أن يكون بين 1 و 12',
            'payslip_file.required' => 'ملف قسائم الرواتب مطلوب',
            'payslip_file.file' => 'يجب أن يكون الملف ملفاً صحيحاً',
            'payslip_file.mimes' => 'يجب أن يكون الملف من نوع PDF',
            'payslip_file.max' => 'حجم الملف يجب أن يكون أقل من 10 ميجابايت',
        ];
    }
}
