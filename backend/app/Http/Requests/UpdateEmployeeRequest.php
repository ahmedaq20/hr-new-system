<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeRequest extends FormRequest
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
            'first_name'=> [
                'required',
                'string',
            ],
            'second_name'=> [
                'required',
                'string',
            ],
            'third_name'=> [
                'required',
                'string',
            ],
            'family_name'=> [
                'required',
                'string',
            ],
            'birth_date'=>[
                'required',
            ],
            'gender'=>[
                'required',
            ],

            'marital_status'=>[
                'required',
            ],
            'primary_phone'=>[
                'required',
            ],
            'secondary_phone'=>[
                'nullable',
            ],
            'email'=>[
                'nullable',
                'email',
                'unique:employees,email,' . request()->route()->employee->id,
            ],

            'employee_number'=> [
                'required',
                'string',
                'unique:employees,employee_number,' . request()->route()->employee->id,
            ],

            'national_id'=>[
                'required',
                'unique:employees,national_id,' . request()->route()->employee->id,
            ],

            'date_of_appointment'=>[
                'nullable',
            ],
            'governorate_id'=>[
                'nullable',
//                'integer',
            ],
            'city_id'=>[
                'nullable',
//                'integer',
            ],
            'address'=>[
                'nullable',
            ],
            'bank_id'=>[
                'nullable',
            ],
            'bank_account_number'=>[
                'nullable',
            ],
            'bank_iban'=>[
                'nullable',
            ],
            'is_alive'=>[
                'nullable',
            ],
            'is_active'=>[
                'nullable',
            ],
            'data_entry_status'=>[
                'nullable',
            ],

            // 1. Organizational Data
            'ministry_id' => ['nullable', 'integer'],
            'management_department_id' => ['nullable', 'integer'],
            'work_department_id' => ['nullable', 'integer'],
            'section_id' => ['nullable', 'integer'],
            'division_id' => ['nullable', 'integer'],
            'unit_id' => ['nullable', 'integer'],
            'crossing_id' => ['nullable', 'integer'],
            'sub_office_id' => ['nullable', 'integer'],

            // 2. Job Data
            'job_title_id' => ['nullable', 'integer'],
            'employment_status_id' => ['nullable', 'integer'],
            'employment_type_id' => ['nullable', 'integer'],
            'contract_id' => ['nullable', 'integer'],
            'administrative_title_id' => ['nullable', 'integer'],
            'program_id' => ['nullable', 'integer'],

            // 3. Classification and Grade Data
            'classification_id' => ['nullable', 'integer'],
            'category_id' => ['nullable', 'integer'],
            'job_scale_id' => ['nullable', 'integer'],
            'degree_id' => ['nullable', 'integer'],
            'seniority' => ['nullable', 'numeric'],

            // 4. Professional Data
            'certificate_id' => ['nullable', 'integer'],
            'actual_service' => ['nullable', 'numeric'],
            'promotion' => ['nullable', 'numeric'],
            'salary_purposes' => ['nullable', 'numeric'],

            // 5. Additional Administrative Data
            'fragmentation' => ['nullable', 'numeric'],
            'is_supervisory' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
