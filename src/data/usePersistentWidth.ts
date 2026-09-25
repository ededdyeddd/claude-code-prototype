import { useEffect, useState } from "react";

/** Panel width that survives reloads. Storage can be blocked (private mode), so every access is guarded. */
export function usePersistentWidth(key: string, fallback: number) {
  const [width, setWidth] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(key));
      return saved > 0 ? saved : fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, String(width));
    } catch {
      // Not saved: the width still works for this session.
    }
  }, [key, width]);
  return [width, setWidth] as const;
}
