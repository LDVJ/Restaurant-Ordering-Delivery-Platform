import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * Delays updating the debounced value until after delay ms have elapsed
 * since the last time the value changed.
 *
 * @param {*} value - Value to debounce (e.g. search query)
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {*} Debounced value
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
