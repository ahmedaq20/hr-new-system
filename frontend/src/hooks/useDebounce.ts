import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayNumber: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delayNumber);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delayNumber]);

    return debouncedValue;
}
