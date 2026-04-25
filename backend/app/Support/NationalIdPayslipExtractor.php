<?php

namespace App\Support;

class NationalIdPayslipExtractor extends PayslipExtractor
{
    public function extract(?string $text): ?string
    {
        $result = parent::extract($text);

        return $result === null || is_string($result) ? $result : null;
    }

    protected function doExtract(string $prepared, string $raw): ?string
    {
        if ($prepared === '') {
            return null;
        }

        $pattern = '/ةيوهلا[\h[:punct:]]*مقر[\s\S]*?(\d{9})/u';

        if (preg_match($pattern, $prepared, $matches)) {
            return $matches[1];
        }

        if (preg_match('/\b(\d{9})\b/', $prepared, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
