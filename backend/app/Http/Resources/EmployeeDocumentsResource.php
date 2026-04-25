<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeDocumentsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'employee_name' => $this->employee ? trim("{$this->employee->first_name} {$this->employee->second_name} {$this->employee->third_name} {$this->employee->family_name}") : 'N/A',
            'document_type' => $this->documentType?->value,
            'certificate_type' => $this->referenceValue?->value,
            'status' => $this->status,
            'notes' => $this->notes,
            'file_url' => $this->file_path ? url('api/v1/academic-documents/'.$this->id.'/download') : null,
            'file_extension' => $this->file_path ? pathinfo($this->file_path, PATHINFO_EXTENSION) : null,
            'upload_date' => $this->created_at?->format('Y-m-d'),
        ];
    }
}
