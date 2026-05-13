'use client';

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/api';

interface ExtraOptions {
  /** Disable the auto-toast for errors (e.g. show inline on form / page instead). */
  silent?: boolean;
}

/**
 * Wraps `useQuery` so failed queries surface a toast by default. AUTH_LOGOUT
 * codes are swallowed (the layout will redirect to /login).
 */
export function useApiQuery<TData, TError = ApiClientError>(
  options: UseQueryOptions<TData, TError> & ExtraOptions,
): UseQueryResult<TData, TError> {
  const { silent, ...queryOptions } = options;
  const query = useQuery<TData, TError>(queryOptions);

  // Surface the error via toast on every new error reference, but not for the
  // forced-logout case (the layout handles that globally).
  useEffect(() => {
    if (silent || !query.isError || !query.error) return;
    if (query.error instanceof ApiClientError && query.error.code === 'AUTH_LOGOUT') {
      return;
    }
    const msg = query.error instanceof Error ? query.error.message : 'Request failed';
    toast.error(msg);
  }, [silent, query.isError, query.error]);

  return query;
}
