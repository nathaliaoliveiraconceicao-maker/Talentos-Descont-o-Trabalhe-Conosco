import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // armazenamento indisponível (ex.: modo privado); ignora silenciosamente
    }
  }, [key, value]);

  const clear = () => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignora
    }
  };

  return [value, setValue, clear] as const;
}
