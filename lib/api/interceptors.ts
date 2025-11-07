// lib/api/interceptors.ts
// Note: This file is kept for reference but interceptors are not used with fetch API
// If you need to handle 401 errors globally, you should implement a wrapper function
// or use a fetch wrapper library that supports interceptors

/**
 * Helper function to handle 401 errors and refresh tokens
 * This should be called manually in your fetch calls or wrapped in a utility function
 */
export async function handleAuthError(error: any, retryFn: () => Promise<Response>): Promise<Response> {
  // Check if it's a 401 error
  if (error?.response?.status === 401 || (error instanceof Response && error.status === 401)) {
    try {
      // Try to refresh the token using API route
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!refreshResponse.ok) {
        // Refresh failed, redirect to main app login
        if (typeof window !== 'undefined') {
          const loginUrl = `https://web.centri.id/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`;
          window.location.href = loginUrl;
        }
        throw new Error('Token refresh failed');
      }

      // Retry the original request
      return retryFn();
    } catch (refreshError) {
      // Refresh failed, redirect to main app login
      if (typeof window !== 'undefined') {
        const loginUrl = `https://web.centri.id/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`;
        window.location.href = loginUrl;
      }
      throw refreshError;
    }
  }

  throw error;
}
