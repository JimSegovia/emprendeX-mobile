import type { LucideIcon } from 'lucide-react-native';
import {
  BarChart2,
  Bell,
  Calculator,
  Calendar,
  FileSignature,
  FileText,
  Home,
  Package,
  Settings,
  Users
} from 'lucide-react-native';

export type ModuleId =
  | 'index'
  | 'operaciones'
  | 'clientes'
  | 'productos'
  | 'calendario'
  | 'cotizaciones'
  | 'contabilidad'
  | 'reportes'
  | 'notificaciones'
  | 'configuracion';

export type ModuleDefinition = {
  id: ModuleId;
  label: string;
  icon: LucideIcon;
  // expo-router tab/screen name inside /(drawer)/(tabs)
  tab: ModuleId;
  // pathname prefixes used to detect active item
  match: string[];
  premium?: boolean;
  detail?: string;
};

export const ALWAYS_VISIBLE_MODULE_IDS: ModuleId[] = [
  'index',
  'calendario',
  'reportes',
  'configuracion',
];

export const DEFAULT_MODULES: ModuleDefinition[] = [
  { id: 'index', label: 'Inicio', icon: Home, tab: 'index', match: ['/'] },
  {
    id: 'operaciones',
    label: 'Operaciones',
    icon: FileText,
    tab: 'operaciones',
    match: ['/operaciones'],
    detail: 'Registros, tareas y seguimiento.',
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: Users,
    tab: 'clientes',
    match: ['/clientes'],
    detail: 'Gestion de contactos y fichas.',
  },
  {
    id: 'productos',
    label: 'Productos-Servicios',
    icon: Package,
    tab: 'productos',
    match: ['/productos'],
    detail: 'Catǭlogo reutilizable para pedidos.',
  },
  {
    id: 'cotizaciones',
    label: 'Cotizaciones',
    icon: FileSignature,
    tab: 'cotizaciones',
    match: ['/cotizaciones'],
    detail: 'Respuestas rapidas para leads.',
  },
  {
    id: 'contabilidad',
    label: 'Contabilidad',
    icon: Calculator,
    tab: 'contabilidad',
    match: ['/contabilidad'],
    detail: 'Control de pagos y gastos.',
  },
  {
    id: 'calendario',
    label: 'Calendario',
    icon: Calendar,
    tab: 'calendario',
    match: ['/calendario'],
    premium: true,
    detail: 'Agenda y recordatorios.',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: BarChart2,
    tab: 'reportes',
    match: ['/reportes'],
    premium: true,
    detail: 'Indicadores y tendencias.',
  },
  {
    id: 'notificaciones',
    label: 'Notificaciones avanzadas',
    icon: Bell,
    tab: 'notificaciones',
    match: ['/notificaciones'],
    premium: true,
    detail: 'Avisos y alertas inteligentes.',
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: Settings,
    tab: 'configuracion',
    match: ['/configuracion'],
    detail: 'Preferencias y cuenta.',
  },
];

export const DEFAULT_MODULE_ORDER: ModuleId[] = DEFAULT_MODULES.map((m) => m.id);

export function buildVisibleModuleOrder(
  order: ModuleId[],
  enabledModuleIds: ModuleId[],
): ModuleId[] {
  const allowedIds = new Set<ModuleId>([...ALWAYS_VISIBLE_MODULE_IDS, ...enabledModuleIds]);

  return order.filter((moduleId) => allowedIds.has(moduleId));
}

export function isModuleAvailable(moduleId: ModuleId, enabledModuleIds: ModuleId[]): boolean {
  return ALWAYS_VISIBLE_MODULE_IDS.includes(moduleId) || enabledModuleIds.includes(moduleId);
}

export function resolveModuleIdFromPathname(pathname: string): ModuleId | null {
  if (pathname.startsWith('/operaciones')) {
    return 'operaciones';
  }

  if (pathname.startsWith('/clientes')) {
    return 'clientes';
  }

  if (pathname.startsWith('/productos')) {
    return 'productos';
  }

  if (pathname.startsWith('/cotizaciones')) {
    return 'cotizaciones';
  }

  if (pathname.startsWith('/contabilidad')) {
    return 'contabilidad';
  }

  if (pathname.startsWith('/reportes')) {
    return 'reportes';
  }

  if (pathname.startsWith('/calendario')) {
    return 'calendario';
  }

  if (pathname.startsWith('/notificaciones')) {
    return 'notificaciones';
  }

  return null;
}
