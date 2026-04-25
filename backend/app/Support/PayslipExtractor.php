<?php

namespace App\Support;

abstract class PayslipExtractor implements PayslipExtractorInterface
{
    /**
     * Template method: prepare text (iconv + normalizations), then run the concrete extraction.
     */
    public function extract(?string $text): mixed
    {
        if ($text === null || $text === '') {
            return null;
        }

        $prepared = static::prepareText($text);

        return $this->doExtract($prepared, $text);
    }

    /**
     * Run the concrete extraction on prepared text. Receives both prepared and raw for debug etc.
     *
     * @return mixed string|null, float|null, etc. depending on the extractor
     */
    abstract protected function doExtract(string $prepared, string $raw): mixed;

    /**
     * Prepare raw payslip text for extraction.
     *
     * 1) Encoding:
     *    - If already valid UTF-8: use as-is.
     *    - If not valid UTF-8: try to repair as UTF-8 (drop invalid bytes). If at least
     *      half the length is kept, treat as "UTF-8 with errors" and use repaired. This
     *      avoids mojibake when Smalot returns UTF-8 with a few bad bytes and
     *      mb_check_encoding is false—we were wrongly running iconv(W1256) on it.
     *    - Else assume Windows-1256: iconv(W1256→UTF-8), then mb_convert, then toUtf8.
     * 2) decodeEntities, stripNumericEntities, normalizeDigits.
     */
    public static function prepareText(?string $text): string
    {
        if ($text === null || $text === '') {
            return '';
        }

        if (! mb_check_encoding($text, 'UTF-8')) {
            $repaired = @iconv('UTF-8', 'UTF-8//IGNORE', $text);
            if ($repaired !== false && $repaired !== '' && strlen($repaired) >= (int) (strlen($text) * 0.5)) {
                $text = $repaired;
            } else {
                $converted = @iconv('Windows-1256', 'UTF-8//IGNORE', $text);
                if ($converted !== false && $converted !== '') {
                    $text = $converted;
                } else {
                    $mb = @mb_convert_encoding($text, 'UTF-8', 'Windows-1256');
                    if ($mb !== false && $mb !== '') {
                        $text = $mb;
                    } else {
                        $text = (string) self::toUtf8($text);
                    }
                }
            }
        }

        $text = (string) self::decodeEntities($text);
        $text = (string) self::stripNumericEntities($text);
        $text = (string) self::normalizeDigits($text);

        return $text;
    }

    /**
     * Parse a captured amount string (handles ٫ , .) into a positive float, or null.
     */
    protected static function parseAmount(string $value): ?float
    {
        $amount = str_replace([' ', '٫', ','], ['', '.', ''], $value);
        $amount = (float) $amount;

        return $amount > 0 ? $amount : null;
    }

    protected static function toUtf8(?string $text): ?string
    {
        if ($text === null || $text === '') {
            return $text;
        }

        $availableEncodings = array_flip(mb_list_encodings());
        $preferred = ['UTF-8', 'Windows-1256', 'CP1256', 'ISO-8859-6', 'ISO-8859-1', 'CP1252'];
        $encodings = array_values(array_filter($preferred, fn ($encoding) => isset($availableEncodings[$encoding])));

        $encoding = mb_detect_encoding($text, $encodings, true);

        if ($encoding && $encoding !== 'UTF-8') {
            return mb_convert_encoding($text, 'UTF-8', $encoding);
        }

        if (! mb_check_encoding($text, 'UTF-8')) {
            foreach ($encodings as $fallbackEncoding) {
                if ($fallbackEncoding === 'UTF-8') {
                    continue;
                }

                $converted = @iconv($fallbackEncoding, 'UTF-8//IGNORE', $text);

                if ($converted !== false) {
                    return $converted;
                }
            }

            return $text;
        }

        return $text;
    }

    protected static function stripNumericEntities(?string $text): ?string
    {
        if ($text === null || $text === '') {
            return $text;
        }

        return preg_replace('/&#\d+;?/', '', $text);
    }

    protected static function decodeEntities(?string $text): ?string
    {
        if ($text === null || $text === '') {
            return $text;
        }

        return html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    protected static function normalizeDigits(?string $text): ?string
    {
        if ($text === null || $text === '') {
            return $text;
        }

        $map = [
            '٠' => '0',
            '١' => '1',
            '٢' => '2',
            '٣' => '3',
            '٤' => '4',
            '٥' => '5',
            '٦' => '6',
            '٧' => '7',
            '٨' => '8',
            '٩' => '9',
        ];

        return strtr($text, $map);
    }
}
