<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeDependentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'dependent_id_number' => ['required', 'string', 'max:255'],
            'birth_date' => ['required', 'date'],
            'mobile' => ['nullable', 'string', 'max:20'],
            'relationship' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'gender' => ['nullable', 'in:ذكر,أنثى'],
            'notes' => ['nullable', 'string'],
            'dependency_proof' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,JPG,JPEG,PNG,PDF,gif,GIF,webp,WEBP,bmp,BMP', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'اسم المعال الرباعي مطلوب',
            'dependent_id_number.required' => 'هوية المعال مطلوبة',
            'dependent_id_number.max' => 'رقم هوية المعال يجب ألا يتجاوز 255 حرف',
            'birth_date.required' => 'تاريخ ميلاد المعال مطلوب',
            'birth_date.date' => 'تاريخ الميلاد يجب أن يكون تاريخ صحيح',
            'mobile.max' => 'رقم الجوال يجب ألا يتجاوز 20 حرف',
            'relationship.required' => 'صلة القرابة مطلوبة',
            'relationship.max' => 'صلة القرابة يجب ألا تتجاوز 255 حرف',
            'address.required' => 'السكن/العنوان مطلوب',
            'gender.in' => 'الجنس يجب أن يكون ذكر أو أنثى',
            'dependency_proof.file' => 'حجة الاعالة يجب أن تكون ملف',
            'dependency_proof.mimes' => 'حجة الاعالة يجب أن تكون من نوع: pdf, jpg, jpeg, png, gif, bmp, webp',
            'dependency_proof.max' => 'حجم حجة الاعالة يجب ألا يتجاوز 10 ميجابايت',
        ];
    }
}
