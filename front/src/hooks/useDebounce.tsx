import { useEffect, useState } from "react";

export default function useDebounce<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    console.log("inside useEffect");
    const timeoutId = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timeoutId);
  }, [value, ms]);

  return debounced;
}
