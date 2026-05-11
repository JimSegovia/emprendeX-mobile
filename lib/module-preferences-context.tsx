import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_MODULE_ORDER, DEFAULT_MODULES, type ModuleDefinition, type ModuleId } from '@/lib/modules';
import { loadModulePreferences, resetModulePreferences, saveModuleOrder } from '@/lib/module-preferences';

type ModulePreferencesContextValue = {
  isHydrated: boolean;
  order: ModuleId[];
  modules: ModuleDefinition[];
  setOrder: (nextOrder: ModuleId[]) => void;
  reset: () => void;
};

const ModulePreferencesContext = createContext<ModulePreferencesContextValue | null>(null);

export function ModulePreferencesProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [order, setOrderState] = useState<ModuleId[]>(DEFAULT_MODULE_ORDER);

  useEffect(() => {
    let cancelled = false;
    loadModulePreferences().then((prefs) => {
      if (cancelled) return;
      setOrderState(prefs.order);
      setIsHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const modules = useMemo(() => {
    const byId = new Map<ModuleId, ModuleDefinition>(DEFAULT_MODULES.map((m) => [m.id, m]));
    return order.map((id) => byId.get(id)).filter(Boolean) as ModuleDefinition[];
  }, [order]);

  const value = useMemo<ModulePreferencesContextValue>(() => {
    return {
      isHydrated,
      order,
      modules,
      setOrder: (nextOrder) => {
        setOrderState(nextOrder);
        // Best-effort persistence.
        saveModuleOrder(nextOrder).catch(() => {});
      },
      reset: () => {
        setOrderState(DEFAULT_MODULE_ORDER);
        resetModulePreferences().catch(() => {});
      },
    };
  }, [isHydrated, modules, order]);

  return <ModulePreferencesContext.Provider value={value}>{children}</ModulePreferencesContext.Provider>;
}

export function useModulePreferences() {
  const ctx = useContext(ModulePreferencesContext);
  if (!ctx) throw new Error('useModulePreferences must be used within ModulePreferencesProvider');
  return ctx;
}
