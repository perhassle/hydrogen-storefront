import * as React from 'react';

/**
 * Hook that adds a delay before showing loading state to prevent flashing
 * @param isLoading - whether the loading state is active
 * @param delay - delay in milliseconds before showing loading (default: 200ms)
 * @returns boolean indicating whether to show loading state
 */
export function useLoadingDelay(isLoading: boolean, delay: number = 200): boolean {
  const [showLoading, setShowLoading] = React.useState(false);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        setShowLoading(true);
      }, delay);
    } else {
      setShowLoading(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, delay]);

  return showLoading;
}