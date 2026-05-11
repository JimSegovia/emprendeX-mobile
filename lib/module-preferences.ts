import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_MODULE_ORDER, DEFAULT_MODULES, type ModuleDefinition, type ModuleId } from '@/lib/modules';

const STORAGE_KEY = 'emprendex:modulePrefs:v1';

type StoredPrefs = {
  order: ModuleId[];
};

type ModulePreferences = {
  order: ModuleId[];
  // Includes migration when the app adds/removes modules.
  orderedModules: ModuleDefinition[];
};

function migrateOrder(order: ModuleId[] | null | undefined): ModuleId[] {
  const defaultOrder = DEFAULT_MODULE_ORDER;
  if (!order || order.length === 0) return defaultOrder;

  const known = new Set(defaultOrder);
  // Keep only modules that still exist.
  const filtered = order.filter((id) => known.has(id));
  // Append any new modules added by an update.
  for (const id of defaultOrder) {
    if (!filtered.includes(id)) filtered.push(id);
  }
  return filtered;
}

export async function loadModulePreferences(): Promise<ModulePreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<StoredPrefs>) : null;
    const order = migrateOrder(parsed?.order as ModuleId[] | undefined);
    const byId = new Map<ModuleId, ModuleDefinition>(DEFAULT_MODULES.map((m) => [m.id, m]));
    const orderedModules = order.map((id) => byId.get(id)).filter(Boolean) as ModuleDefinition[];
    return { order, orderedModules };
  } catch {
    const order = DEFAULT_MODULE_ORDER;
    return { order, orderedModules: DEFAULT_MODULES };
  }
}

export async function saveModuleOrder(order: ModuleId[]): Promise<void> {
  const migrated = migrateOrder(order);
  const payload: StoredPrefs = { order: migrated };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export async function resetModulePreferences(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
