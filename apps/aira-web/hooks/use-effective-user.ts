'use client';

import { useUser } from '@repo/core';
import type { User } from '@repo/core';
import {
  getDevMockUser,
  isDevMockAuth,
  DEFAULT_DEV_MOCK_USER,
} from '@/lib/dev-mock-auth';

/**
 * In development with mock user: returns a synthetic User so UI and guard
 * can use user.is_active (mapped from mock phoneVerified) and user.f_n etc.
 * In production or when no mock user: delegates to useUser().
 */
function mockUserToUser(mock: { id: string; email: string; phoneVerified: boolean }): User {
  return {
    i: mock.id,
    f_n: 'Dev',
    l_n: 'User',
    u: mock.email,
    c_at: new Date().toISOString(),
    e: mock.email,
    is_email_verified: true,
    is_active: mock.phoneVerified,
    p_id: null,
    is_admin: false,
  };
}

export function useEffectiveUser(): ReturnType<typeof useUser> {
  const queryResult = useUser();

  if (process.env.NODE_ENV === 'production') {
    return queryResult;
  }

  const mockUser = getDevMockUser();
  if (!mockUser) {
    return queryResult;
  }

  return {
    ...queryResult,
    data: mockUserToUser(mockUser),
    isLoading: false,
    isPending: false,
    error: null,
    isError: false,
    status: 'success',
    fetchStatus: 'idle',
  } as ReturnType<typeof useUser>;
}

export { isDevMockAuth };
