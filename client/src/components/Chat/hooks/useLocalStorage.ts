// Resources
import { useCallback, useState } from "react";

// Types
export type SetStorage = (value: string) => void;

/**
 * Allows you to fetch and set a local storage item.
 * @param key The key of the local storage item.
 * @param initialValue The initial value to set for the item.
 * @returns The methods to manipulate the local storage item.
 */
export default function useLocalStorage(key: string, initialValue: unknown) {
  const [storedValue, setStoredValue] = useState<string>(() => {
    const initial = String(initialValue);
    if (typeof window === "undefined") return initial;

    try {
      const item = window.localStorage.getItem(key);

      if (item !== null) {
        return item;
      } else {
        window.localStorage.setItem(key, initial);
        return initial;
      }
    } catch (e) {
      console.error(e);
      return initial;
    }
  });

  const setValue = useCallback(
    (value: string) => {
      try {
        setStoredValue(value);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, value);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [key]
  );

  return [storedValue, setValue] as const;
}
