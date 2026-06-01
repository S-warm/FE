import { useEffect, useRef, useState } from 'react';

/**
 * Hook for animating numeric values from 0 to target
 *
 * @param target - Target number to animate to
 * @param duration - Animation duration in milliseconds (default: 1500ms)
 * @param decimalPlaces - Number of decimal places (default: 1)
 * @returns Current animated value
 */
export const useNumberAnimation = (
  target: number,
  duration: number = 1500,
  decimalPlaces: number = 1
): number => {
  const [displayValue, setDisplayValue] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const start = 0;
    const increment = target / (duration / 16); // 60fps 기준
    let current = start;

    // 이전 타이머 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      current += increment;

      if (current >= target) {
        setDisplayValue(target);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      } else {
        // decimalPlaces에 따라 소수점 자리 제한
        const multiplier = Math.pow(10, decimalPlaces);
        const rounded = Math.floor(current * multiplier) / multiplier;
        setDisplayValue(rounded);
      }
    }, 16);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [target, duration, decimalPlaces]);

  return displayValue;
};

/**
 * Hook for animating numeric values from one number to another
 *
 * @param start - Starting number
 * @param end - Ending number
 * @param duration - Animation duration in milliseconds (default: 1500ms)
 * @param decimalPlaces - Number of decimal places (default: 1)
 * @returns Current animated value
 */
export const useRangeAnimation = (
  start: number,
  end: number,
  duration: number = 1500,
  decimalPlaces: number = 1
): number => {
  const [displayValue, setDisplayValue] = useState(start);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const diff = end - start;
    const increment = diff / (duration / 16); // 60fps 기준
    let current = start;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      current += increment;

      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setDisplayValue(end);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      } else {
        const multiplier = Math.pow(10, decimalPlaces);
        const rounded = Math.floor(current * multiplier) / multiplier;
        setDisplayValue(rounded);
      }
    }, 16);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [start, end, duration, decimalPlaces]);

  return displayValue;
};
