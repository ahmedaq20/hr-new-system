<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreEmployeeSpouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'marriage_date' => ['required', 'date'],
            'spouse_id_number' => ['required', 'string', 'max:50'],
            'marital_status' => ['required', 'string', 'in:'.implode(',', \App\Enums\MaritalStatus::values())],
            'is_working' => ['required', 'boolean'],
            'work_sector' => ['nullable', 'string', 'in:خاص,حكومة,مؤسسة دولية'],
            'private_company_name' => ['nullable', 'string', 'max:255'],
            'international_organization_name' => ['nullable', 'string', 'max:255'],
            'marriage_contract' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,JPG,JPEG,PNG,PDF,gif,GIF,webp,WEBP,bmp,BMP', 'max:10240'],
            'mobile' => ['nullable', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'اسم الزوج/ة الرباعي مطلوب',
            'marriage_date.required' => 'تاريخ الزواج مطلوب',
            'spouse_id_number.required' => 'رقم هوية الزوج/ة مطلوب',
            'spouse_id_number.max' => 'رقم هوية الزوج/ة يجب ألا يتجاوز 50 حرف',
            'marital_status.required' => 'الحالة الاجتماعية مطلوبة',
            'is_working.required' => 'يجب تحديد حالة عمل الزوج/ة',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $data = $this->all();

            if (! isset($data['is_working'])) {
                return;
            }

            if ($data['is_working']) {
                if (empty($data['work_sector'])) {
                    $validator->errors()->add('work_sector', 'الرجاء اختيار جهة عمل الزوج/ة.');
                }

                if (($data['work_sector'] ?? null) === 'خاص' && empty($data['private_company_name'])) {
                    $validator->errors()->add('private_company_name', 'الرجاء إدخال اسم الشركة / المؤسسة.');
                }

                if (($data['work_sector'] ?? null) === 'مؤسسة دولية' && empty($data['international_organization_name'])) {
                    $validator->errors()->add('international_organization_name', 'الرجاء إدخال اسم المؤسسة الدولية.');
                }
            }
        });
    }
}
