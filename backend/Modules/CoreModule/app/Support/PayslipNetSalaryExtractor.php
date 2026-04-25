<?php

namespace Modules\CoreModule\Support;

use App\Support\NetSalaryPayslipExtractor;

class PayslipNetSalaryExtractor
{
    /**
     * Extract net salary from payslip text.
     *
     * @param  string|null  $text  The raw payslip text (e.g. from PDF). Preparation (iconv + normalizations) is done internally.
     * @return float|null The net salary amount, or null if not found
     */
    public static function extract(?string $text): ?float
    {
        return (new NetSalaryPayslipExtractor)->extract($text);
    }
}
