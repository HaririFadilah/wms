'use client';

import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/api';

interface ExtraOptions {
  /** Disable auto error toast — caller will show errors inline. */
  silent?: boolean;
  /** Optional success toast message; if omitted, no toast on success. */
  successMessage?: string;
}

/**
 * Wraps `useMutation` so failed mutations surface a toast by default. AUTH_LOGOUT
 * codes are swallowed (the layout handles redirect).
 */
export function useApiMutation<
  TData,
  TVariables = void,
  TError = ApiClientError,
  TOnMutateResult = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult> & ExtraOptions,
): UseMutationResult<TData, TError, TVariables, TOnMutateResult> {
  const { silent, successMessage, onError, onSuccess, ...rest } = options;

  return useMutation<TData, TError, TVariables, TOnMutateResult>({
    ...rest,
    onSuccess: (data, variables, onMutateResult, context) => {
      if (successMessage) toast.success(successMessage);
      onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      const isLogout = error instanceof ApiClientError && error.code === 'AUTH_LOGOUT';
      if (!silent && !isLogout) {
        const msg = error instanceof Error ? error.message : 'Request failed';
        toast.error(msg);
      }
      onError?.(error, variables, onMutateResult, context);
    },
  });
}
