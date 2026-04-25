<?php

namespace App\Http\Controllers\Contract\TempContract;

use App\Http\Controllers\Controller;
use App\Http\Requests\TempContractProjectRequest;
use App\Http\Resources\TempContractProjectResource;
use App\Http\Resources\TempContractProjectsResource;
use App\Models\TempContractProject;
use Illuminate\Http\Response;

class TempContractProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $projects = TempContractProject::orderByDesc('created_at')->get();

        return new TempContractProjectsResource($projects);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TempContractProjectRequest $request)
    {
        $project = TempContractProject::create($request->validated());

        return (new TempContractProjectResource($project))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(TempContractProject $tempContractProject)
    {
        return (new TempContractProjectResource($tempContractProject))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TempContractProjectRequest $request, TempContractProject $tempContractProject)
    {
        $tempContractProject->update($request->validated());

        $tempContractProject = TempContractProject::find($tempContractProject->id);

//        $message = ['success'=> 'تم تحديث بيانات المشروع بنجاح.'];
        return (new TempContractProjectResource($tempContractProject))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TempContractProject $tempContractProject)
    {
        $tempContractProject->delete();

        $message = 'تم الحذف بنجاح';
        return response()->json(compact('message'))->setStatusCode(Response::HTTP_ACCEPTED);
    }
}
