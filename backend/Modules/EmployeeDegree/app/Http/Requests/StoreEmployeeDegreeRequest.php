<?php

namespace Modules\EmployeeDegree\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeDegreeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['nullable', 'exists:employees,id'],
            'qualification_id' => ['nullable', 'exists:reference_data,id'],

            'major_name' => ['nullable', 'string', 'max:255'],
            'university_name' => ['nullable', 'string', 'max:255'],

            'country_id' => ['nullable', 'exists:countries,id'],

            'graduation_date' => ['nullable', 'date'],
            'graduation_year' => ['nullable', 'integer', 'digits:4'],

            'grade' => ['nullable', 'string', 'max:50'],

            'document_path' => ['nullable', 'string'],
            'certificate_attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],

            'notes' => ['nullable', 'string'],
        ];
    }
}
