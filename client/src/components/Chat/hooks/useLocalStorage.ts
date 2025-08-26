// Resources
import { useCallback, useState } from "react";

export default function useLocalStorage(key: string, initialValue: unknown) {
  const [storedValue, setStoredValue] = useState<string>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item || initialValue;
    } catch (e) {
      console.error(e);
      return initialValue;
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
