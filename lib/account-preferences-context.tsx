import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_COLOR_PALETTE_ID,
  getColorPalette,
  loadAccountPreferences,
  saveAccountPreferences,
  type AccountPreferences,
  type ColorPalette,
  type ColorPaletteId,
} from '@/lib/account-preferences';
import {
  fetchBusinessPreferences,
  updateBusinessPreferences,
} from '@/lib/business-preferences';
import { useAuthSession } from '@/lib/auth-session-context';

type AccountPreferencesContextValue = {
  isHydrated: boolean;
  isSaving: boolean;
  colorPaletteId: ColorPaletteId;
  logoUrl: string | null;
  palette: ColorPalette;
  setColorPalette: (nextPaletteId: ColorPaletteId) => Promise<void>;
  refreshPreferences: () => Promise<void>;
};

const AccountPreferencesContext = createContext<AccountPreferencesContextValue | null>(null);

export function AccountPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthSession();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<AccountPreferences>({
    colorPaletteId: DEFAULT_COLOR_PALETTE_ID,
    logoUrl: null,
  });

  useEffect(() => {
    let cancelled = false;

    loadAccountPreferences().then((preferences) => {
      if (cancelled) {
        return;
      }

      setPreferences(preferences);
      setIsHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const syncServerPreferences = async () => {
      if (!accessToken) {
        return;
      }

      try {
        const serverPreferences = await fetchBusinessPreferences(accessToken);

        if (cancelled) {
          return;
        }

        const nextPreferences: AccountPreferences = {
          colorPaletteId: serverPreferences.colorPaletteId,
          logoUrl: serverPreferences.logoUrl,
        };

        setPreferences(nextPreferences);
        await saveAccountPreferences(nextPreferences);
      } catch {
        // Keep local cache when the server is temporarily unavailable.
      }
    };

    void syncServerPreferences();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const palette = useMemo(() => getColorPalette(preferences.colorPaletteId), [preferences.colorPaletteId]);

  const value = useMemo<AccountPreferencesContextValue>(() => {
    return {
      isHydrated,
      isSaving,
      colorPaletteId: preferences.colorPaletteId,
      logoUrl: preferences.logoUrl,
      palette,
      setColorPalette: async (nextPaletteId) => {
        if (preferences.colorPaletteId === nextPaletteId) {
          return;
        }

        const previousPreferences = preferences;
        const nextPreferences: AccountPreferences = {
          ...previousPreferences,
          colorPaletteId: nextPaletteId,
        };

        setPreferences(nextPreferences);
        setIsSaving(true);

        try {
          await saveAccountPreferences(nextPreferences);

          if (accessToken) {
            const savedPreferences = await updateBusinessPreferences(accessToken, {
              colorPaletteId: nextPaletteId,
            });

            const syncedPreferences: AccountPreferences = {
              colorPaletteId: savedPreferences.colorPaletteId,
              logoUrl: savedPreferences.logoUrl,
            };

            setPreferences(syncedPreferences);
            await saveAccountPreferences(syncedPreferences);
          }
        } catch (error) {
          setPreferences(previousPreferences);
          await saveAccountPreferences(previousPreferences);
          throw error;
        } finally {
          setIsSaving(false);
        }
      },
      refreshPreferences: async () => {
        if (!accessToken) {
          return;
        }

        try {
          const serverPreferences = await fetchBusinessPreferences(accessToken);
          const syncedPreferences: AccountPreferences = {
            colorPaletteId: serverPreferences.colorPaletteId,
            logoUrl: serverPreferences.logoUrl,
          };

          setPreferences(syncedPreferences);
          await saveAccountPreferences(syncedPreferences);
        } catch {
          // Keep local cache when server is unavailable
        }
      },
    };
  }, [accessToken, isHydrated, isSaving, palette, preferences]);

  return (
    <AccountPreferencesContext.Provider value={value}>
      {children}
    </AccountPreferencesContext.Provider>
  );
}

export function useAccountPreferences() {
  const context = useContext(AccountPreferencesContext);

  if (!context) {
    throw new Error('useAccountPreferences must be used within AccountPreferencesProvider');
  }

  return context;
}
