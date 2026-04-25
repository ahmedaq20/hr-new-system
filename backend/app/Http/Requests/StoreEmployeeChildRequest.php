<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeChildRequest extends FormRequest
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
                'required_if:is_university_student,1',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:5120',
            ],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'full_name.required' => 'الاسم الرباعي مطلوب',

            'national_id.required' => 'رقم هوية الابن/الابنة مطلوب',
            'national_id.max' => 'رقم هوية الابن/الابنة يجب ألا يتجاوز 255 حرف',

            'birth_date.required' => 'تاريخ الميلاد مطلوب',
            'birth_date.date' => 'تاريخ الميلاد يجب أن يكون تاريخ صحيح',

            'gender.required' => 'الجنس مطلوب',
            'gender.in' => 'الجنس يجب أن يكون ذكر أو أنثى',

            'marital_status.in' => 'الحالة الاجتماعية يجب أن تكون من القيم المسموح بها',

            'employee_id.required' => 'الموظف مطلوب',
            'employee_id.exists' => 'الموظف غير موجود',

            'is_working.boolean' => 'حالة العمل يجب أن تكون نعم أو لا',

            'is_university_student.boolean' => 'حالة الدراسة يجب أن تكون نعم أو لا',

            'mother_full_name.required' => 'اسم الأم الرباعي مطلوب',
            'mother_id_number.required' => 'رقم هوية الأم مطلوب',
            'mother_id_number.max' => 'رقم هوية الأم يجب ألا يتجاوز 9 أحرف',

            'notes.string' => 'الملاحظات يجب أن تكون نصًا',

            'id_card_image.file' => 'يجب أن تكون صورة الهوية ملف',
            'id_card_image.mimes' => 'صورة الهوية يجب أن تكون من نوع: pdf,jpg,jpeg,png',
            'id_card_image.max' => 'حجم صورة الهوية يجب أن لا يتجاوز 5 ميجابايت',

            'birth_certificate_image.file' => 'يجب أن تكون شهادة الميلاد ملف',
            'birth_certificate_image.mimes' => 'شهادة الميلاد يجب أن تكون من نوع: pdf,jpg,jpeg,png',
            'birth_certificate_image.max' => 'حجم شهادة الميلاد يجب أن لا يتجاوز 5 ميجابايت',

            'university_certificate_image.required_if' => 'يجب إرفاق شهادة القيد الجامعي بما أن الابن طالب جامعي',
            'university_certificate_image.file' => 'يجب أن تكون شهادة القيد الجامعي ملفًا',
            'university_certificate_image.mimes' => 'شهادة القيد الجامعي يجب أن تكون من نوع: pdf,jpg,jpeg,png',
            'university_certificate_image.max' => 'حجم شهادة القيد الجامعي يجب ألا يتجاوز 5 ميجابايت',
        ];
    }
}
