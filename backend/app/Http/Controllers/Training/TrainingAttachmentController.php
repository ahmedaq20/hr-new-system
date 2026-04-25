<?php

namespace App\Http\Controllers\Training;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTrainingCertificateRequest;
use App\Http\Requests\StoreTrainingPhotoRequest;
use App\Models\TrainingAttachment;
use App\Models\TrainingCertificate;
use App\Models\TrainingCourse;
use App\Models\TrainingPhoto;
use App\Services\Storage\TrainingAttachmentStorageInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TrainingAttachmentController extends Controller
{
    public function __construct(
        protected TrainingAttachmentStorageInterface $storage
    ) {}

    public function attachments(TrainingCourse $training_course): JsonResponse
    {
        $attachments = $training_course->attachments()
            ->latest()
            ->get()
            ->map(fn ($attachment) => [
                'id' => $attachment->id,
                'file_name' => $attachment->file_name,
                'file_type' => $attachment->file_type,
                'file_size' => $this->formatSize($attachment->file_size),
                'description' => $attachment->description,
                'url' => $this->storage->url($attachment->file_path),
                'created_at' => $attachment->created_at->format('Y-m-d H:i'),
            ]);

        return response()->json(['data' => $attachments]);
    }

    public function storeAttachment(Request $request, TrainingCourse $training_course): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:20480', // 20MB max
            'description' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $file = $request->file('file');
        $directory = "training-courses/{$training_course->id}/attachments";
        $fileName = time().'_'.$file->getClientOriginalName();

        try {
            $path = $this->storage->store($file, $directory, $fileName);
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['success' => false, 'message' => 'تعذر حفظ الملف.'], 500);
        }

        $attachment = $training_course->attachments()->create([
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientOriginalExtension(),
            'file_size' => $file->getSize(),
            'description' => $request->input('description'),
        ]);

        return response()->json([
            'success' => true,
            'attachment' => [
                'id' => $attachment->id,
                'file_name' => $attachment->file_name,
                'file_type' => $attachment->file_type,
                'file_size' => $this->formatSize($attachment->file_size),
                'description' => $attachment->description,
                'url' => $this->storage->url($attachment->file_path),
            ],
        ]);
    }

    public function deleteAttachment(TrainingCourse $training_course, TrainingAttachment $attachment): JsonResponse
    {
        if ($attachment->training_course_id !== $training_course->id) {
            abort(404);
        }

        $this->storage->delete($attachment->file_path);
        $attachment->delete();

        return response()->json(['success' => true]);
    }

    private function formatSize($bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function photos(TrainingCourse $training_course): JsonResponse
    {
        $photos = $training_course->photos()
            ->latest('captured_at')
            ->latest()
            ->get()
            ->map(fn ($photo) => [
                'id' => $photo->id,
                'captured_at' => optional($photo->captured_at)->format('Y-m-d'),
                'caption' => $photo->caption,
                'url' => $this->storage->url($photo->file_path),
            ]);

        return response()->json(['data' => $photos]);
    }

    public function storePhoto(StoreTrainingPhotoRequest $request, TrainingCourse $training_course): JsonResponse
    {
        $file = $request->file('photo');

        if (! $file || ! $file->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'الملف المرفوع غير صالح.',
            ], 422);
        }

        $directory = "training-courses/{$training_course->id}/photos";
        $fileName = time().'_'.str()->random(8).'.'.$file->getClientOriginalExtension();

        try {
            $path = $this->storage->store($file, $directory, $fileName);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'تعذر حفظ الملف.',
            ], 500);
        }

        $photo = $training_course->photos()->create([
            'file_path' => $path,
            'captured_at' => $request->input('captured_at'),
            'caption' => $request->input('caption'),
        ]);

        return response()->json([
            'success' => true,
            'photo' => [
                'id' => $photo->id,
                'captured_at' => optional($photo->captured_at)->format('Y-m-d'),
                'caption' => $photo->caption,
                'url' => $this->storage->url($photo->file_path),
            ],
        ]);
    }

    public function deletePhoto(TrainingCourse $training_course, TrainingPhoto $photo): JsonResponse
    {
        if ($photo->training_course_id !== $training_course->id) {
            abort(404);
        }

        $this->storage->delete($photo->file_path);
        $photo->delete();

        return response()->json(['success' => true]);
    }

    public function certificates(TrainingCourse $training_course): JsonResponse
    {
        $certificates = $training_course->certificates()
            ->with('employee')
            ->latest('issued_at')
            ->latest()
            ->get()
            ->map(fn ($cert) => [
                'id' => $cert->id,
                'employee_id' => $cert->employee_id,
                'employee_name' => $cert->employee?->full_name ?? '-',
                'employee_number' => $cert->employee?->employee_number ?? '-',
                'issued_at' => optional($cert->issued_at)->format('Y-m-d'),
                'notes' => $cert->notes,
                'url' => $this->storage->url($cert->file_path),
            ]);

        return response()->json(['data' => $certificates]);
    }

    public function storeCertificate(StoreTrainingCertificateRequest $request, TrainingCourse $training_course): JsonResponse
    {
        $existing = TrainingCertificate::query()
            ->where('training_course_id', $training_course->id)
            ->where('employee_id', $request->input('employee_id'))
            ->first();
        $oldPath = $existing?->file_path;

        $file = $request->file('certificate');

        if (! $file || ! $file->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'الملف المرفوع غير صالح.',
            ], 422);
        }

        $directory = "training-courses/{$training_course->id}/certificates";
        $fileName = time().'_'.str()->random(8).'.'.$file->getClientOriginalExtension();

        try {
            $path = $this->storage->store($file, $directory, $fileName);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'تعذر حفظ الملف.',
            ], 500);
        }

        $cert = TrainingCertificate::updateOrCreate(
            [
                'training_course_id' => $training_course->id,
                'employee_id' => $request->input('employee_id'),
            ],
            [
                'file_path' => $path,
                'issued_at' => $request->input('issued_at'),
                'notes' => $request->input('notes'),
            ]
        );

        if ($oldPath && $oldPath !== $cert->file_path) {
            $this->storage->delete($oldPath);
        }

        $cert->load('employee');

        return response()->json([
            'success' => true,
            'certificate' => [
                'id' => $cert->id,
                'employee_id' => $cert->employee_id,
                'employee_name' => $cert->employee?->full_name ?? '-',
                'employee_number' => $cert->employee?->employee_number ?? '-',
                'issued_at' => optional($cert->issued_at)->format('Y-m-d'),
                'notes' => $cert->notes,
                'url' => $this->storage->url($cert->file_path),
            ],
        ]);
    }

    public function deleteCertificate(TrainingCourse $training_course, TrainingCertificate $certificate): JsonResponse
    {
        if ($certificate->training_course_id !== $training_course->id) {
            abort(404);
        }

        $this->storage->delete($certificate->file_path);
        $certificate->delete();

        return response()->json(['success' => true]);
    }
}
