import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  buildVisibleModuleOrder,
  DEFAULT_MODULE_ORDER,
  DEFAULT_MODULES,
  isModuleAvailable,
  type ModuleDefinition,
  type ModuleId,
} from '@/lib/modules';
import { useAuthSession } from '@/lib/auth-session-context';
import {
  loadModulePreferences,
  resetModulePreferences,
  saveModuleOrder,
} from '@/lib/module-preferences';

type ModulePreferencesContextValue = {
  isHydrated: boolean;
  order: ModuleId[];
  modules: ModuleDefinition[];
  visibleOrder: ModuleId[];
  enabledModuleIds: ModuleId[];
  isModuleEnabled: (moduleId: ModuleId) => boolean;
  setOrder: (nextOrder: ModuleId[]) => void;
  reset: () => void;
};

const ModulePreferencesContext = createContext<ModulePreferencesContextValue | null>(null);

/**
 * Combina preferencias locales de orden con los modulos habilitados por la sesion actual.
 */
export function ModulePreferencesProvider({ children }: { children: React.ReactNode }) {
  const { authState } = useAuthSession();
  const [isHydrated, setIsHydrated] = useState(false);
  const [order, setOrderState] = useState<ModuleId[]>(DEFAULT_MODULE_ORDER);

  const enabledModuleIds = useMemo(() => {
    return (authState?.user.enabledModuleIds ?? []) as ModuleId[];
  }, [authState]);

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

  const visibleOrder = useMemo(() => {
    if (!authState) {
      return order;
    }

    return buildVisibleModuleOrder(order, enabledModuleIds);
  }, [authState, enabledModuleIds, order]);

  const modules = useMemo(() => {
    const byId = new Map<ModuleId, ModuleDefinition>(DEFAULT_MODULES.map((m) => [m.id, m]));
    return visibleOrder.map((id) => byId.get(id)).filter(Boolean) as ModuleDefinition[];
  }, [visibleOrder]);

  const value = useMemo<ModulePreferencesContextValue>(() => {
    return {
      isHydrated,
      order,
      modules,
      visibleOrder,
      enabledModuleIds,
      isModuleEnabled: (moduleId) => isModuleAvailable(moduleId, enabledModuleIds),
      setOrder: (nextOrder) => {
        const hiddenModuleIds = order.filter((moduleId) => !nextOrder.includes(moduleId));
        const mergedOrder = [...nextOrder, ...hiddenModuleIds];

        setOrderState(mergedOrder);
        // Best-effort persistence.
        saveModuleOrder(mergedOrder).catch(() => {});
      },
      reset: () => {
        setOrderState(DEFAULT_MODULE_ORDER);
        resetModulePreferences().catch(() => {});
      },
    };
  }, [enabledModuleIds, isHydrated, modules, order, visibleOrder]);

  return (
    <ModulePreferencesContext.Provider value={value}>{children}</ModulePreferencesContext.Provider>
  );
}

/**
 * Hook de acceso al orden visible de modulos y a sus reglas de disponibilidad.
 */
export function useModulePreferences() {
  const ctx = useContext(ModulePreferencesContext);
  if (!ctx) throw new Error('useModulePreferences must be used within ModulePreferencesProvider');
  return ctx;
}
