// src/components/auth/UserInfo.tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';

/**
 * Example component showing how to use authentication
 *
 * Usage:
 * import UserInfo from '@/components/auth/UserInfo';
 *
 * <UserInfo />
 */
export default function UserInfo() {
  const { user, displayName, role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        <p className="text-gray-500">Loading user info...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 border rounded bg-yellow-50">
        <p className="text-yellow-700">Not authenticated</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded bg-blue-50">
      <h3 className="font-bold text-lg mb-2">User Information</h3>
      <div className="space-y-1 text-sm">
        <p><strong>Display Name:</strong> {displayName}</p>
        <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
        <p><strong>Role:</strong> {role}</p>
        <p><strong>User ID:</strong> {user?.sub}</p>
      </div>

      <button
        onClick={() => {
          window.location.href = 'https://web.centri.id/auth/logout';
        }}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
