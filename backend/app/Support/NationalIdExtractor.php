<?php

namespace App\Support;

class NationalIdExtractor
{
    public static function extract(?string $text): ?string
    {
        return (new NationalIdPayslipExtractor)->extract($text);
    }
}
