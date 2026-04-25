<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeChildRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => [
                'required',
                'string',
                'max:255',
            ],
            'national_id' => [
                'required',
                'string',
                'max:255',
            ],
            'birth_date' => [
                'required',
                'date',
            ],
            'gender' => [
                'required',
                'in:ذكر,أنثى',
            ],
            'marital_status' => [
                'nullable',
                'in:أعزب,متزوج,مطلق,أرمل',
            ],
            'employee_id' => [
                'required',
                'exists:employees,id',
            ],
            'is_working' => [
                'nullable',
                'boolean',
            ],
            'is_university_student' => [
                'nullable',
                'boolean',
            ],
            'mother_full_name' => [
                'required',
                'string',
                'max:255',
            ],
            'mother_id_number' => [
                'required',
                'string',
                'max:9',
            ],
            'notes' => [
                'nullable',
                'string',
            ],
            'id_card_image' => [
                'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:5120',
            ],
            'birth_certificate_image' => [
                'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:5120',
            ],
            'university_certificate_image' => [
                ($this->is_university_student && $this->route('child') && $this->route('child')->university_certificate_image) ? 'nullable' : 'required_if:is_university_student,1',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:5120',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            // full_name
            'full_name.required' => 'الاسم الكامل مطلوب.',
            'full_name.string' => 'الاسم الكامل يجب أن يكون نصًا.',
            'full_name.max' => 'الاسم الكامل لا يجب أن يتجاوز 255 حرفًا.',

            // national_id
            'national_id.required' => 'رقم الهوية مطلوب.',
            'national_id.string' => 'رقم الهوية يجب أن يكون نصًا.',
            'national_id.max' => 'رقم الهوية غير صالح.',

            // birth_date
            'birth_date.required' => 'تاريخ الميلاد مطلوب.',
            'birth_date.date' => 'تاريخ الميلاد غير صالح.',

            // gender
            'gender.required' => 'الجنس مطلوب.',
            'gender.in' => 'الجنس يجب أن يكون ذكر أو أنثى.',

            // marital_status
            'marital_status.in' => 'الحالة الاجتماعية غير صحيحة.',

            // employee_id
            'employee_id.required' => 'الموظف مطلوب.',
            'employee_id.exists' => 'الموظف غير موجود.',

            // is_working
            'is_working.boolean' => 'حقل يعمل حاليًا يجب أن يكون true أو false.',

            // is_university_student
            'is_university_student.boolean' => 'حقل طالب جامعي يجب أن يكون true أو false.',

            // mother_full_name
            'mother_full_name.required' => 'اسم الأم الكامل مطلوب.',
            'mother_full_name.string' => 'اسم الأم يجب أن يكون نصًا.',
            'mother_full_name.max' => 'اسم الأم لا يجب أن يتجاوز 255 حرفًا.',

            // mother_id_number
            'mother_id_number.required' => 'رقم هوية الأم مطلوب.',
            'mother_id_number.string' => 'رقم هوية الأم يجب أن يكون نصًا.',
            'mother_id_number.max' => 'رقم هوية الأم يجب ألا يتجاوز 9 أرقام.',

            // notes
            'notes.string' => 'الملاحظات يجب أن تكون نصًا.',

            // id_card_image
            'id_card_image.file' => 'صورة الهوية يجب أن تكون ملفًا.',
            'id_card_image.mimes' => 'صورة الهوية يجب أن تكون PDF أو صورة.',
            'id_card_image.max' => 'حجم صورة الهوية يجب ألا يتجاوز 5MB.',

            // birth_certificate_image
            'birth_certificate_image.file' => 'شهادة الميلاد يجب أن تكون ملفًا.',
            'birth_certificate_image.mimes' => 'شهادة الميلاد يجب أن تكون PDF أو صورة.',
            'birth_certificate_image.max' => 'حجم شهادة الميلاد يجب ألا يتجاوز 5MB.',

            'university_certificate_image.required_if' => 'يجب إرفاق شهادة القيد الجامعي بما أن الابن طالب جامعي',
            'university_certificate_image.file' => 'يجب أن تكون شهادة القيد الجامعي ملفًا',
            'university_certificate_image.mimes' => 'شهادة القيد الجامعي يجب أن تكون من نوع: pdf,jpg,jpeg,png',
            'university_certificate_image.max' => 'حجم شهادة القيد الجامعي يجب ألا يتجاوز 5 ميجابايت',
        ];
    }
}
