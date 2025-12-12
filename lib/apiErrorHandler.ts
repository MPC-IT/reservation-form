import { useGoogleAuth } from '../contexts/GoogleAuthContext';

// Hook for API calls with Google auth error handling
export function useApiWithErrorHandling() {
  const { handleGoogleAuthError } = useGoogleAuth();

  const apiCall = async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const error = new Error(body?.error || 'API request failed');
        
        // Handle Google auth errors globally
        handleGoogleAuthError({
          status: response.status,
          message: body?.error || 'API request failed'
        });
        
        throw error;
      }

      return response;
    } catch (error) {
      // If it's a network error or other non-HTTP error
      if (error instanceof Error && !error.message.includes('Failed to fetch')) {
        handleGoogleAuthError({
          status: 0,
          message: error.message
        });
      }
      throw error;
    }
  };

  return { apiCall };
}

// Utility function for checking if an error is a Google auth error
export function isGoogleAuthError(error: any): boolean {
  return (
    error?.status === 401 ||
    error?.status === 403 ||
    (typeof error?.message === 'string' && (
      error.message.includes('invalid authentication credentials') ||
      error.message.includes('insufficient authentication scopes')
    )) ||
    (typeof error === 'string' && (
      error.includes('invalid authentication credentials') ||
      error.includes('insufficient authentication scopes')
    ))
  );
}
