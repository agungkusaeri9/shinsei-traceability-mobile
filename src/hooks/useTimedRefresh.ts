import { useCallback, useEffect, useRef, useState } from 'react';

export const useTimedRefresh = (durationMs = 1000) => {
  const [refreshing, setRefreshing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const onRefresh = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setRefreshing(true);
    timeoutRef.current = setTimeout(() => {
      setRefreshing(false);
      timeoutRef.current = null;
    }, durationMs);
  }, [durationMs]);

  return { refreshing, onRefresh };
};
