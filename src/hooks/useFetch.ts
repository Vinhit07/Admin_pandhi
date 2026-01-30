// useFetch Hook (TypeScript)
// Generic hook for data fetching with loading, error, and data states

import { useState, useEffect, useCallback } from 'react';

interface UseFetchOptions {
    autoFetch?: boolean;
    dependencies?: any[];
}

interface UseFetchReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<T | void>;
}

/**
 * Custom hook for data fetching
 * @param fetchFn - Async function that fetches data
 * @param options - Configuration options
 * @returns { data, loading, error, refetch }
 */
export const useFetch = <T = any>(
    fetchFn: () => Promise<T>,
    options: UseFetchOptions = {}
): UseFetchReturn<T> => {
    const { autoFetch = false, dependencies = [] } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(autoFetch);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchFn();
            setData(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchFn]);

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [autoFetch, fetchData, ...dependencies]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
};
