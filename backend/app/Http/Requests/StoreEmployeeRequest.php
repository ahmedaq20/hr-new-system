<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
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
//                'date_format:' . config('panel.date_format') . ' ' . config('panel.time_format'),
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
                'unique:employees,email',
            ],

            'national_id'=>[
                'required',
                'unique:employees',
//                'nullable',
            ],
            'employee_number'=> [
                'required',
                'string',
                'unique:employees',
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
            ]
        ];
    }
}
