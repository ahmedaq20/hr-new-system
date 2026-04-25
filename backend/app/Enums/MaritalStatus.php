<?php

namespace App\Enums;

enum MaritalStatus: string
{
    case MARRIED = 'متزوج';
    case DIVORCED = 'منفصل';
    case WIDOWED = 'متوفاة';
    case SINGLE = 'أعزب/عزباء';

    public function label(): string
    {
        return match ($this) {
            self::MARRIED => 'متزوج',
            self::DIVORCED => 'منفصل',
            self::WIDOWED => 'متوفاة',
            self::SINGLE => 'أعزب/عزباء',
        };
    }

    public static function options(): array
    {
        return [
            self::MARRIED->value => self::MARRIED->label(),
            self::DIVORCED->value => self::DIVORCED->label(),
            self::WIDOWED->value => self::WIDOWED->label(),
            self::SINGLE->value => self::SINGLE->label(),
        ];
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
