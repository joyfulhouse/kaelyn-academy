/**
 * useFormSubmission Hook
 *
 * Reusable hook for handling form submission with loading, success,
 * and error states. Eliminates duplicate form submission logic.
 */

import { useState, useCallback } from "react";

export interface UseFormSubmissionOptions<TData, TResponse> {
  /** API endpoint to submit to */
  endpoint: string;
  /** HTTP method (defaults to POST) */
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  /** Callback on successful submission */
  onSuccess?: (response: TResponse, data: TData) => void;
  /** Callback on error */
  onError?: (error: Error, data: TData) => void;
  /** Transform data before sending */
  transformData?: (data: TData) => unknown;
  /** Reset success state after milliseconds (0 = never) */
  resetSuccessAfter?: number;
}

export interface UseFormSubmissionResult<TData> {
  /** Whether submission is in progress */
  isSubmitting: boolean;
  /** Whether submission was successful */
  isSuccess: boolean;
  /** Error message if submission failed */
  error: string | null;
  /** Submit handler */
  submit: (data: TData) => Promise<boolean>;
  /** Reset states to initial values */
  reset: () => void;
}

/**
 * Hook for handling form submissions with consistent state management
 *
 * @example
 * const { isSubmitting, isSuccess, error, submit } = useFormSubmission<ContactFormData>({
 *   endpoint: "/api/contact",
 *   onSuccess: (_, data) => form.reset(),
 * });
 *
 * async function onSubmit(data: ContactFormData) {
 *   await submit(data);
 * }
 */
export function useFormSubmission<TData, TResponse = unknown>({
  endpoint,
  method = "POST",
  onSuccess,
  onError,
  transformData,
  resetSuccessAfter = 0,
}: UseFormSubmissionOptions<TData, TResponse>): UseFormSubmissionResult<TData> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
  }, []);

  const submit = useCallback(
    async (data: TData): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const body = transformData ? transformData(data) : data;

        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          let errorMessage: string;

          try {
            const errorData = await response.json();
            errorMessage = errorData.error || `Request failed with status ${response.status}`;
          } catch {
            errorMessage = `Request failed with status ${response.status}`;
          }

          throw new Error(errorMessage);
        }

        let responseData: TResponse | undefined;
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          responseData = await response.json();
        }

        setIsSuccess(true);
        onSuccess?.(responseData as TResponse, data);

        // Auto-reset success state if configured
        if (resetSuccessAfter > 0) {
          setTimeout(() => setIsSuccess(false), resetSuccessAfter);
        }

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage), data);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [endpoint, method, onSuccess, onError, transformData, resetSuccessAfter]
  );

  return {
    isSubmitting,
    isSuccess,
    error,
    submit,
    reset,
  };
}

/**
 * Simplified version for common POST submissions
 *
 * @example
 * const { isSubmitting, isSuccess, error, submit } = useSimpleSubmission("/api/contact");
 */
export function useSimpleSubmission<TData>(
  endpoint: string,
  onSuccess?: () => void
): UseFormSubmissionResult<TData> {
  return useFormSubmission<TData>({
    endpoint,
    onSuccess,
  });
}

export default useFormSubmission;
