import { useState, useEffect, useCallback } from 'react';
import { authFetch, handleAuthError } from '@/utils/auth';

interface UseAdminFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdminFetch<T>(url: string, options?: { immediate?: boolean }): UseAdminFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(url);
      if (handleAuthError(res)) return;
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (options?.immediate === false) return;
    fetchData();
  }, [fetchData, options?.immediate]);

  return { data, loading, error, refetch: fetchData };
}

interface UseAdminMutationResult<TReq, TRes> {
  mutate: (body: TReq) => Promise<TRes | null>;
  loading: boolean;
  error: string | null;
}

export function useAdminMutation<TReq, TRes>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
): UseAdminMutationResult<TReq, TRes> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (body: TReq): Promise<TRes | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await authFetch(url, {
          method,
          body: JSON.stringify(body),
        });
        if (handleAuthError(res)) return null;
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || errData?.error || `Request failed: ${res.statusText}`);
        }
        return await res.json();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'An error occurred';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url, method]
  );

  return { mutate, loading, error };
}
