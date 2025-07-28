import * as React from 'react';

interface OptimisticState<T> {
  data: T;
  isPending: boolean;
  error?: Error;
}

/**
 * Hook for optimistic updates that immediately show expected result
 * @param initialData - initial data state
 * @returns [state, optimisticUpdate, reset] tuple
 */
export function useOptimisticUpdate<T>(
  initialData: T
): [
  OptimisticState<T>,
  (optimisticData: T, asyncUpdate: () => Promise<T>) => Promise<void>,
  () => void
] {
  const [state, setState] = React.useState<OptimisticState<T>>({
    data: initialData,
    isPending: false,
  });

  const optimisticUpdate = React.useCallback(
    async (optimisticData: T, asyncUpdate: () => Promise<T>) => {
      // Immediately update with optimistic data
      setState({
        data: optimisticData,
        isPending: true,
      });

      try {
        // Perform actual update
        const result = await asyncUpdate();
        setState({
          data: result,
          isPending: false,
        });
      } catch (error) {
        // Revert to previous state on error
        setState({
          data: initialData,
          isPending: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        });
      }
    },
    [initialData]
  );

  const reset = React.useCallback(() => {
    setState({
      data: initialData,
      isPending: false,
    });
  }, [initialData]);

  return [state, optimisticUpdate, reset];
}