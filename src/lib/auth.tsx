'use client';

import * as React from 'react';
import { Recursiv } from '@recursiv/sdk';
import { ORG_ID, anonSdk, createAuthedSdk } from './recursiv';
import { storage } from './storage';

const KEYS = {
  apiKey: 'com98:api_key',
  user: 'com98:user',
  version: 'com98:auth_version',
};

const AUTH_VERSION = '1';

const API_KEY_SCOPES = [
  'posts:read', 'posts:write',
  'users:read', 'users:write',
  'chat:read', 'chat:write',
  'agents:read', 'agents:write',
  'organizations:read', 'organizations:write',
  'memory:read', 'memory:write',
  'databases:read', 'databases:write',
  'storage:read', 'storage:write',
  'settings:read', 'settings:write',
  'billing:read', 'billing:write',
  'projects:read', 'projects:write',
] as const;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  sdk: Recursiv | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [sdk, setSdk] = React.useState<Recursiv | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        if (storage.get(KEYS.version) !== AUTH_VERSION) {
          clearAll();
          return;
        }
        const apiKey = storage.get(KEYS.apiKey);
        const userJson = storage.get(KEYS.user);
        if (!apiKey || !userJson) return;

        const authedSdk = createAuthedSdk(apiKey);
        try {
          await authedSdk.users.me();
          setSdk(authedSdk);
          setUser(JSON.parse(userJson));
        } catch {
          clearAll();
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  function clearAll() {
    storage.remove(KEYS.apiKey);
    storage.remove(KEYS.user);
    storage.remove(KEYS.version);
  }

  function persist(apiKey: string, authUser: AuthUser) {
    storage.set(KEYS.apiKey, apiKey);
    storage.set(KEYS.user, JSON.stringify(authUser));
    storage.set(KEYS.version, AUTH_VERSION);
  }

  const sendOtp = React.useCallback(async (email: string) => {
    await anonSdk.auth.sendOtp({ email });
  }, []);

  const verifyOtp = React.useCallback(async (email: string, otp: string) => {
    const result = await anonSdk.auth.verifyOtpAndCreateKey(
      { email, otp },
      {
        name: 'com98-' + Date.now(),
        scopes: [...API_KEY_SCOPES],
        organizationId: ORG_ID,
      } as any,
    );

    // Org membership gate. Only members of COM98 are allowed past this point.
    const next = createAuthedSdk(result.apiKey);
    const orgs = await next.organizations.list();
    const isMember = (orgs.data || []).some((o: any) => o.id === ORG_ID);
    if (!isMember) {
      throw new Error('You do not have access. Ask Jack to add you as an org member.');
    }

    const authUser: AuthUser = {
      id: result.user?.id || '',
      name: result.user?.name || '',
      email: result.user?.email || email,
      image: result.user?.image ?? null,
    };
    persist(result.apiKey, authUser);
    setSdk(next);
    setUser(authUser);
  }, []);

  const signOut = React.useCallback(async () => {
    clearAll();
    setSdk(null);
    setUser(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      sdk,
      isLoading,
      isAuthenticated: !!user && !!sdk,
      sendOtp,
      verifyOtp,
      signOut,
    }),
    [user, sdk, isLoading, sendOtp, verifyOtp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
