<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReferenceDataRequest extends FormRequest
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
        $referenceDataId = $this->route('referenceData')->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'value' => ['required', 'string', 'max:255', 'unique:reference_data,value,'.$referenceDataId.',id,name,'.$this->input('name')],
            'slug' => ['nullable', 'string', 'max:255', 'unique:reference_data,slug,'.$referenceDataId],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'اسم التصنيف مطلوب',
            'name.string' => 'اسم التصنيف يجب أن يكون نص',
            'name.max' => 'اسم التصنيف لا يمكن أن يكون أكثر من 255 حرف',
            'value.required' => 'القيمة مطلوبة',
            'value.string' => 'القيمة يجب أن تكون نص',
            'value.max' => 'القيمة لا يمكن أن تكون أكثر من 255 حرف',
            'value.unique' => 'هذه القيمة موجودة بالفعل في هذا التصنيف',
            'slug.unique' => 'المعرف الثابت مستخدم مسبقاً',
            'slug.max' => 'المعرف الثابت لا يمكن أن يتجاوز 255 حرفاً',
        ];
    }
}
