<?php

namespace App\Services\Storage;

use Illuminate\Http\UploadedFile;

interface TrainingAttachmentStorageInterface
{
    /**
     * Store a file in the specified directory.
     */
    public function store(UploadedFile $file, string $directory, string $fileName): string;

    /**
     * Delete a file from storage.
     */
    public function delete(string $path): bool;

    /**
     * Get the public URL for a stored file.
     */
    public function url(string $path): string;
}
