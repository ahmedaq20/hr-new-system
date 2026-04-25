<?php

namespace App\Support;

class NetSalaryPayslipExtractor extends PayslipExtractor
{
    public function extract(?string $text): ?float
    {
        $result = parent::extract($text);

        return is_numeric($result) ? (float) $result : null;
    }

    protected function doExtract(string $prepared, string $raw): ?float
    {
        // Last line: "لكيش" + optional \x02 + spaces + number. Example: "لكيش\x02 2970٫00\t0٫00\t..."
        $lines = preg_split('/\r\n|\r|\n/', $prepared);
        for ($i = count($lines) - 1; $i >= 0; $i--) {
            $line = $lines[$i];
            if (trim($line) === '') {
                continue;
            }
            if (preg_match('/لكيش\x02?\s*(\d+[٫.,]\d+)/u', $line, $m)) {
                return self::parseAmount($m[1]);
            }
            break;
        }

        return null;
    }
}
