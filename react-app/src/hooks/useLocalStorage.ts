import { useCallback, useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initial: T,
) {
  const [value, setValueState] =
    useState<T>(() => {
      try {
        const raw =
          window.localStorage.getItem(key);
        return raw
          ? JSON.parse(raw) as T
          : initial;
      } catch {
        return initial;
      }
    });

  const setValue = useCallback((next: T) => {
    setValueState(next);

    try {
      window.localStorage.setItem(
        key,
        JSON.stringify(next),
      );
    } catch {
      // ReviewOps login popups can block storage; React state must still advance.
    }
  }, [key]);

  return [value, setValue] as const;
}
