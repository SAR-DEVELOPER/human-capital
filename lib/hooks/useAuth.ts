// lib/hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, getUserDisplayName, getUserRole } from '@/lib/auth/client';
import type { User } from '@/lib/auth/types';

interface UseAuthReturn {
  user: User | null;
  displayName: string;
  role: string;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hook to get current user information from auth_session cookie
 * This reads the JWT token client-side for display purposes only
 * The middleware handles actual authentication/authorization
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user from cookie
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  return {
    user,
    displayName: getUserDisplayName(user),
    role: getUserRole(user),
    isLoading,
    isAuthenticated: !!user,
  };
}
