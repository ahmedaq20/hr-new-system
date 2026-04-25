<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTempContractEmployeeRequest extends FormRequest
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
            'first_name' => [
                'required',
                'string',
            ],
            'second_name' => [
                'required',
                'string',
            ],
            'third_name' => [
                'required',
                'string',
            ],
            'family_name' => [
                'required',
                'string',
            ],
            'birth_date' => [
                'required',
            ],
            'national_id' => [
                'required',
            ],
            'start_contract_date' => [
                'required',
            ],
            'end_contract_date' => [
                'required',
            ],
            'gender' => [
                'nullable',
            ],
            'marital_status' => [
                'nullable',
            ],
            'primary_phone' => [
                'nullable',
            ],
            'secondary_phone' => [
                'nullable',
            ],
            'governorate_id' => [
                'nullable',
                //                'integer',
            ],
            'city_id' => [
                'nullable',
                //                'integer',
            ],
            'certificate_id' => [
                'nullable',
            ],
            'address' => [
                'nullable',
            ],
            'position_type' => [
                'nullable',
            ],
            'university_name' => [
                'nullable',
            ],
            'major_name' => [
                'nullable',
            ],
            'graduation_date' => [
                'nullable',
            ],
            'temp_contract_project_id' => [
                'required',
                'exists:temp_contract_projects,id',
            ],

        ];
    }
}
