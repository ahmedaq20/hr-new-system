<?php

namespace App\Http\Controllers\Contract;

use App\Http\Controllers\Concerns\ProvidesEmployeeReferenceData;
use App\Http\Controllers\Controller;
use App\Http\Resources\ContractEmployeesResource;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class ContractEmployeeController extends Controller
{
    use ProvidesEmployeeReferenceData;

    private array $contracts = [
        'permanent' => [
            'label' => 'عقود تشغيل دائمة',
            'value' => 'عقد دائم',
        ],
        'paused' => [
            'label' => 'عقود تشغيل متوقفة',
            'value' => 'عقد متوقف',
        ],
        'unknown' => [
            'label' => 'عقود تشغيل غير معلومة',
            'value' => 'عقد غير معلوم',
        ],
    ];

    public function __construct(private readonly EmployeeTableService $employeeTableService) {}

    public function index(string $contractType, Request $request)
    {
        $definition = $this->resolveContractType($contractType);

        $payload = $this->employeeTableService->handle($request, [
            'contract_values' => [$definition['value']],
        ]);

        return new ContractEmployeesResource($payload);
    }

    private function resolveContractType(string $contractType): array
    {
        $definition = Arr::get($this->contracts, $contractType);

        if (! $definition) {
            abort(404);
        }

        return $definition;
    }
}
