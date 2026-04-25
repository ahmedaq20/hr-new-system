<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTrainingCertificateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'certificate' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB
            'employee_id' => 'required|exists:employees,id',
            'issued_at' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
