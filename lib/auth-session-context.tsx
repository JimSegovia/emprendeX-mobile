import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  type AuthSessionResponse,
  type AuthStateResponse,
  clearAuthSession,
  fetchCurrentUser,
  loadAuthSession,
  saveAuthSession,
} from '@/lib/auth';

type AuthSessionContextValue = {
  isHydrated: boolean;
  accessToken: string | null;
  authState: AuthStateResponse | null;
  setAuthenticatedSession: (session: AuthSessionResponse) => Promise<void>;
  updateAuthState: (state: AuthStateResponse) => void;
  signOut: () => Promise<void>;
  refreshAuthState: () => Promise<AuthStateResponse | null>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthStateResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    const hydrateAuthSession = async () => {
      try {
        const storedSession = await loadAuthSession();

        if (!storedSession) {
          return;
        }

        const nextAuthState = await fetchCurrentUser(storedSession.accessToken);

        if (cancelled) {
          return;
        }

        setAccessToken(storedSession.accessToken);
        setAuthState(nextAuthState);
      } catch {
        await clearAuthSession();

        if (!cancelled) {
          setAccessToken(null);
          setAuthState(null);
        }
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    };

    void hydrateAuthSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthSessionContextValue>(() => {
    return {
      isHydrated,
      accessToken,
      authState,
      setAuthenticatedSession: async (session) => {
        await saveAuthSession(session);
        setAccessToken(session.accessToken);
        setAuthState({
          requiresOnboarding: session.requiresOnboarding,
          user: session.user,
        });
      },
      updateAuthState: (state) => {
        setAuthState(state);
      },
      signOut: async () => {
        await clearAuthSession();
        setAccessToken(null);
        setAuthState(null);
      },
      refreshAuthState: async () => {
        if (!accessToken) {
          return null;
        }

        try {
          const nextAuthState = await fetchCurrentUser(accessToken);
          setAuthState(nextAuthState);
          return nextAuthState;
        } catch {
          await clearAuthSession();
          setAccessToken(null);
          setAuthState(null);
          return null;
        }
      },
    };
  }, [accessToken, authState, isHydrated]);

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error('useAuthSession must be used within AuthSessionProvider');
  }

  return context;
}
