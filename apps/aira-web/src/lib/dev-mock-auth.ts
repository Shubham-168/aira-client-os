/**
 * Development-only mock user state for local auth/onboarding flow.
 * Not used in production. Single source of truth for dev mock user.
 */

const DEV_MOCK_USER_KEY = 'dev-mock-user';

export interface DevMockUser {
  id: string;
  email: string;
  phoneVerified: boolean;
}

function getStored(): DevMockUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DEV_MOCK_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DevMockUser;
    return parsed && typeof parsed.phoneVerified === 'boolean' ? parsed : null;
  } catch {
    return null;
  }
}

function setStored(user: DevMockUser | null) {
  if (typeof window === 'undefined') return;
  if (user === null) {
    localStorage.removeItem(DEV_MOCK_USER_KEY);
  } else {
    localStorage.setItem(DEV_MOCK_USER_KEY, JSON.stringify(user));
  }
}

export function getDevMockUser(): DevMockUser | null {
  if (process.env.NODE_ENV === 'production') return null;
  return getStored();
}

export function setDevMockUser(user: DevMockUser): void {
  if (process.env.NODE_ENV === 'production') return;
  setStored(user);
}

export function updateDevMockUserPhoneVerified(phoneVerified: boolean): void {
  if (process.env.NODE_ENV === 'production') return;
  const current = getStored();
  if (current) setStored({ ...current, phoneVerified });
}

export function clearDevMockUser(): void {
  if (process.env.NODE_ENV === 'production') return;
  setStored(null);
}

export function isDevMockAuth(): boolean {
  return process.env.NODE_ENV !== 'production' && getStored() !== null;
}

/** Default mock user for first login in dev */
export const DEFAULT_DEV_MOCK_USER: DevMockUser = {
  id: 'dev-user',
  email: 'dev@aira.ai',
  phoneVerified: false,
};

const AUTH_STORAGE_KEY = 'auth-storage';

/**
 * Clear all client-side state used by auth/onboarding (dev only).
 * Call this before redirect on dev "delete account".
 */
export function clearAllDevAuthStorage(): void {
  if (process.env.NODE_ENV === 'production') return;
  setStored(null);
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(DEV_MOCK_USER_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}
