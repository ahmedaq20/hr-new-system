<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTrainingCourseRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'training_type_id' => 'required|exists:reference_data,id',
            'training_classification_id' => 'required|exists:reference_data,id',
            'target_audience' => 'nullable|string|max:1000',
            'funding_entity' => 'nullable|string|max:255',
            'duration' => 'nullable|string|max:255',
            'implementation_mechanism' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'other_details' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_active' => 'nullable|boolean',
        ];
    }
}
