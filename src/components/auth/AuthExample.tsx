// src/components/auth/AuthExample.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * Example component demonstrating:
 * 1. Using useAuth hook for user info
 * 2. Making authenticated API calls
 * 3. Handling logout
 *
 * Usage:
 * import AuthExample from '@/components/auth/AuthExample';
 *
 * <AuthExample />
 */
export default function AuthExample() {
  const { user, displayName, role, isAuthenticated } = useAuth();
  const [apiResult, setApiResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testApiCall = async () => {
    setLoading(true);
    try {
      // Example API call - using API route to avoid CORS
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch profile: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || 'Failed to fetch profile');
      }

      const data = await response.json();
      setApiResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setApiResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    window.location.href = 'https://web.centri.id/auth/logout';
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <h2 className="text-2xl font-bold">Authentication Example</h2>
        <p className="text-red-600">
          You should not see this if middleware is working correctly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Authentication Example</h2>

      {/* User Info Section */}
      <div className="border rounded-lg p-4 bg-white shadow">
        <h3 className="text-lg font-semibold mb-3">Current User</h3>
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="font-medium w-32">Display Name:</span>
            <span>{displayName}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Email:</span>
            <span>{user?.email || 'N/A'}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">Role:</span>
            <span>{role}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-32">User ID:</span>
            <span className="text-xs">{user?.sub}</span>
          </div>
        </div>
      </div>

      {/* API Call Example */}
      <div className="border rounded-lg p-4 bg-white shadow">
        <h3 className="text-lg font-semibold mb-3">Test API Call</h3>
        <p className="text-sm text-gray-600 mb-3">
          Click the button below to test an authenticated API call. The API client
          automatically includes cookies and handles token refresh.
        </p>
        <button
          onClick={testApiCall}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Test API Call (/auth/profile)'}
        </button>

        {apiResult && (
          <pre className="mt-4 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-64">
            {apiResult}
          </pre>
        )}
      </div>

      {/* Actions */}
      <div className="border rounded-lg p-4 bg-white shadow">
        <h3 className="text-lg font-semibold mb-3">Actions</h3>
        <div className="space-y-2">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
          <button
            onClick={() => window.location.href = 'https://web.centri.id/dashboard'}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Go to Main App Dashboard
          </button>
        </div>
      </div>

      {/* Developer Info */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Developer Notes</h3>
        <div className="text-sm space-y-2 text-gray-700">
          <p>
            <strong>Authentication:</strong> Handled by middleware.ts which checks
            for auth_session cookie
          </p>
          <p>
            <strong>User Info:</strong> Retrieved from useAuth() hook which decodes
            JWT token
          </p>
          <p>
            <strong>API Calls:</strong> Made with api client from @/lib/api which
            includes cookies
          </p>
          <p>
            <strong>Token Refresh:</strong> Automatic via interceptors when 401
            received
          </p>
          <p>
            <strong>Logout:</strong> Redirects to main app logout endpoint
          </p>
        </div>
      </div>
    </div>
  );
}
