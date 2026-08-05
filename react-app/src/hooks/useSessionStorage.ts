import { useCallback, useState } from 'react';

export function useSessionStorage<T>(
  key: string,
  initial: T,
) {
  const [value, setValueState] =
    useState<T>(() => {
      try {
        const raw =
          window.sessionStorage.getItem(key);
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
      window.sessionStorage.setItem(
        key,
        JSON.stringify(next),
      );
    } catch {
      // Restricted frames may block session storage; in-memory state still works.
    }
  }, [key]);

  return [value, setValue] as const;
}
