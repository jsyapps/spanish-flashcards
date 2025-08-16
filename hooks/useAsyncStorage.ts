import { useState, useCallback } from 'react';

// Generic function type with unknown parameters
type AsyncFunction<T, P extends readonly unknown[] = readonly unknown[]> = 
  (...args: P) => Promise<T>;

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncStorageResult<T, P extends readonly unknown[] = readonly unknown[]> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: P) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAsyncStorage = <T, P extends readonly unknown[] = readonly unknown[]>(
  asyncFunction?: AsyncFunction<T, P>,
  initialData: T | null = null
): UseAsyncStorageResult<T, P> => {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: P): Promise<T | null> => {
    if (!asyncFunction) {
      console.warn('No async function provided to useAsyncStorage');
      return null;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await asyncFunction(...args);
      
      setState(prev => ({ ...prev, data: result, loading: false }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      console.error('Async storage operation failed:', err);
      return null;
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
    setData,
    setLoading,
    setError,
  };
};

// Specialized hook for operations that don't return data but have loading/error states
export const useAsyncOperation = <P extends readonly unknown[] = readonly unknown[]>(
  asyncFunction?: (...args: P) => Promise<void>
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: P): Promise<boolean> => {
    if (!asyncFunction) {
      console.warn('No async function provided to useAsyncOperation');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      await asyncFunction(...args);
      
      setLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setLoading(false);
      console.error('Async operation failed:', err);
      return false;
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
    setLoading,
    setError,
  };
};