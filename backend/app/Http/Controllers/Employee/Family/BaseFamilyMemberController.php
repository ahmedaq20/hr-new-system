<?php

namespace App\Http\Controllers\Employee\Family;

use App\Http\Controllers\Controller;
use App\Modules\Family\Config\FamilyMemberConfig;
use App\Modules\Family\Services\FamilyMemberService;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

abstract class BaseFamilyMemberController extends Controller
{
    protected FamilyMemberService $familyService;
    protected string $type;

    public function __construct(FamilyMemberService $familyService)
    {
        $this->familyService = $familyService;
        $this->type = $this->getType();
    }

    /**
     * Get the family member type (spouse, child, dependent).
     */
    abstract protected function getType(): string;

    /**
     * Get the model instance.
     */
    abstract protected function getModel();

    /**
     * Get the store request class.
     */
    abstract protected function getStoreRequestClass(): string;

    /**
     * Get the update request class.
     */
    abstract protected function getUpdateRequestClass(): string;

    /**
     * Get the view name for index.
     */
    abstract protected function getIndexView(): string;

    /**
     * Get the view name for create.
     */
    abstract protected function getCreateView(): string;

    /**
     * Get the view name for edit.
     */
    abstract protected function getEditView(): string;

    /**
     * Get the view name for form partial.
     */
    abstract protected function getFormPartialView(): string;

    /**
     * Get the view name for form modal partial.
     */
    abstract protected function getFormModalPartialView(): string;

    /**
     * Get the view name for employee index.
     */
    abstract protected function getEmployeeIndexView(): string;

    /**
     * Get the route name for index.
     */
    abstract protected function getIndexRoute(): string;

    /**
     * Get the route name for employee edit.
     */
    abstract protected function getEmployeeEditRoute(): string;

    /**
     * Get the route name for employee index.
     */
    abstract protected function getEmployeeIndexRoute(): string;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): View
    {
        return view($this->getIndexView());
    }

    /**
     * Get data for DataTables (AJAX).
     */
    public function data(Request $request): JsonResponse
    {
        // This should be implemented by child classes or use a service
        // For now, we'll leave it abstract or use a service pattern
        return response()->json(['data' => []]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Employee $employee): View
    {
        return view($this->getCreateView(), compact('employee'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Employee $employee): RedirectResponse|JsonResponse
    {
        $requestClass = $this->getStoreRequestClass();
        $validated = app($requestClass)->validated();
        
        $validated = $this->familyService->prepareStoreData($request, $this->type, $employee->id, $validated);
        $validated = $this->familyService->handleFileUploads($request, $this->type, $validated);

        $model = $this->getModel();
        $model::create($validated);

        $message = $this->familyService->getSuccessMessage($this->type, 'store');
        $modalKey = $this->familyService->getModalSessionKey($this->type);

        if ($request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => $message,
            ]);
        }

        return redirect()
            ->route($this->getEmployeeEditRoute(), $employee)
            ->with('success', $message)
            ->with($modalKey, true);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Employee $employee, $member): View
    {
        $config = FamilyMemberConfig::getType($this->type);
        $viewPrefix = $config['view_prefix'];
        $modelClass = $config['model'];
        
        // Ensure $member is a model instance (Laravel route model binding should handle this, but we check to be safe)
        if (is_string($member) || is_numeric($member)) {
            $member = $modelClass::findOrFail($member);
        }

        if (request()->ajax()) {
            $referer = request()->headers->get('referer');
            $indexRouteName = $this->getIndexRoute();
            $indexRouteUrl = route($indexRouteName);
            
            // Check if request is from index page (more flexible check)
            $isFromIndex = false;
            if ($referer) {
                // Check if referer contains the route URL or path
                $indexPath = parse_url($indexRouteUrl, PHP_URL_PATH);
                $refererPath = parse_url($referer, PHP_URL_PATH);
                $isFromIndex = str_contains($referer, $indexRouteUrl) || 
                              ($indexPath && $refererPath && str_contains($refererPath, $indexPath));
            }
            
            if ($isFromIndex) {
                return view("{$viewPrefix}._form_modal", [
                    'employee' => $employee,
                    $this->type => $member,
                ]);
            }

            return view($this->getFormPartialView(), [
                'employee' => $employee,
                $this->type => $member,
            ]);
        }

        return view($this->getEditView(), [
            'employee' => $employee,
            $this->type => $member,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $employee, $member): RedirectResponse|JsonResponse
    {
        $config = FamilyMemberConfig::getType($this->type);
        $modelClass = $config['model'];
        
        // Ensure $member is a model instance
        if (is_string($member) || is_numeric($member)) {
            $member = $modelClass::findOrFail($member);
        }
        
        $requestClass = $this->getUpdateRequestClass();
        $validated = app($requestClass)->validated();
        
        $validated = $this->familyService->prepareUpdateData($request, $this->type, $member, $validated);
        $validated = $this->familyService->handleFileUploads($request, $this->type, $validated);

        $member->update($validated);

        $message = $this->familyService->getSuccessMessage($this->type, 'update');
        $modalKey = $this->familyService->getModalSessionKey($this->type);

        if ($request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => $message,
            ]);
        }

        return redirect()
            ->route($this->getEmployeeEditRoute(), $employee)
            ->with('success', $message)
            ->with($modalKey, true);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee, $member): RedirectResponse|JsonResponse
    {
        $config = FamilyMemberConfig::getType($this->type);
        $modelClass = $config['model'];
        
        // Ensure $member is a model instance
        if (is_string($member) || is_numeric($member)) {
            $member = $modelClass::findOrFail($member);
        }
        
        $this->familyService->deleteFiles($this->type, $member);
        $member->delete();

        $message = $this->familyService->getSuccessMessage($this->type, 'destroy');
        $modalKey = $this->familyService->getModalSessionKey($this->type);

        // Return JSON response for AJAX requests
        if (request()->ajax()) {
            return response()->json([
                'success' => true,
                'message' => $message,
            ]);
        }

        return redirect()
            ->route($this->getEmployeeEditRoute(), $employee)
            ->with('success', $message)
            ->with($modalKey, true);
    }

    /**
     * Display listing for a specific employee.
     */
    public function indexForEmployee(Employee $employee): View|JsonResponse
    {
        $config = FamilyMemberConfig::getType($this->type);
        $relationship = $config['relationship'];
        
        $members = $employee->$relationship()->latest()->paginate(15);

        $view = view($this->getEmployeeIndexView(), [
            'employee' => $employee,
            $this->type.'s' => $members,
        ]);

        // For AJAX requests, return just the HTML content
        if (request()->ajax()) {
            return response()->json([
                'html' => $view->render()
            ]);
        }

        return $view;
    }
}
