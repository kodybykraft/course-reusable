import { EcomError } from '@course/core';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    field?: string;
    statusCode: number;
  };
}

/** Convert any error to a safe JSON response. Never leaks stack traces. */
export function handleError(err: unknown): ErrorResponse {
  if (err instanceof EcomError) {
    return {
      error: {
        code: err.code,
        message: err.message,
        field: 'field' in err ? (err as { field?: string }).field : undefined,
        statusCode: err.statusCode,
      },
    };
  }

  if (err instanceof Error) {
    // Log the full error server-side but don't expose details
    console.error('[EcomError]', err.message, err.stack);
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        statusCode: 500,
      },
    };
  }

  return {
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
    },
  };
}

/** Extract HTTP status code from an error */
export function getStatusCode(err: unknown): number {
  if (err instanceof EcomError) return err.statusCode;
  return 500;
}
