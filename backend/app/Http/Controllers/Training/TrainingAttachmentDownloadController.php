<?php

namespace App\Http\Controllers\Training;

use App\Http\Controllers\Controller;
use App\Models\TrainingCertificate;
use App\Models\TrainingCourse;
use App\Models\TrainingPhoto;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TrainingAttachmentDownloadController extends Controller
{
    public function download(string $path): StreamedResponse|Response|BinaryFileResponse
    {
        $decodedPath = base64_decode($path);

        if (! $decodedPath) {
            abort(404);
        }

        // التحقق من أن الملف موجود في قاعدة البيانات (أمان إضافي)
        $photo = TrainingPhoto::where('file_path', $decodedPath)->first();
        $certificate = TrainingCertificate::where('file_path', $decodedPath)->first();

        if (! $photo && ! $certificate) {
            abort(404);
        }

        // التحقق من الصلاحيات - يمكن الوصول للدورة
        $courseId = $photo?->training_course_id ?? $certificate?->training_course_id;
        if ($courseId) {
            $course = TrainingCourse::find($courseId);
            if (! $course) {
                abort(404);
            }
            // يمكن إضافة المزيد من فحوصات الصلاحيات هنا
        }

        $disk = config('filesystems.training_attachments_disk', 'private');

        if (! Storage::disk($disk)->exists($decodedPath)) {
            abort(404);
        }

        $filePath = Storage::disk($disk)->path($decodedPath);

        return response()->file($filePath);
    }
}
