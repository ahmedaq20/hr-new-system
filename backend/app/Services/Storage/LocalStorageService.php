<?php

namespace App\Services\Storage;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class LocalStorageService implements TrainingAttachmentStorageInterface
{
    protected string $disk = 'public';

    public function store(UploadedFile $file, string $directory, string $fileName): string
    {
        return $file->storeAs($directory, $fileName, $this->disk);
    }

    public function delete(string $path): bool
    {
        if (Storage::disk($this->disk)->exists($path)) {
            return Storage::disk($this->disk)->delete($path);
        }
        return false;
    }

    public function url(string $path): string
    {
        return Storage::disk($this->disk)->url($path);
    }
}
