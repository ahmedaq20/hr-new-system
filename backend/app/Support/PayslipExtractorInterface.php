<?php

namespace App\Support;

interface PayslipExtractorInterface
{
    /**
     * Extract value from raw payslip text. Preparation (iconv + normalizations) is done internally.
     *
     * @return mixed string|null for national ID, float|null for net salary, etc.
     */
    public function extract(?string $text): mixed;
}
