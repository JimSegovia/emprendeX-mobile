import type { LucideIcon } from 'lucide-react-native';
import {
  Home,
  FileText,
  Users,
  Package,
  Calendar,
  FileSignature,
  CreditCard,
  BarChart2,
  Settings,
} from 'lucide-react-native';

export type ModuleId =
  | 'index'
  | 'operaciones'
  | 'clientes'
  | 'productos'
  | 'calendario'
  | 'cotizaciones'
  | 'pagos'
  | 'reportes'
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

export const DEFAULT_MODULES: ModuleDefinition[] = [
  { id: 'index', label: 'Inicio', icon: Home, tab: 'index', match: ['/'] },
  { id: 'operaciones', label: 'Operaciones', icon: FileText, tab: 'operaciones', match: ['/operaciones'], detail: 'Registros, tareas y seguimiento.' },
  { id: 'clientes', label: 'Clientes', icon: Users, tab: 'clientes', match: ['/clientes'], detail: 'Gestion de contactos y fichas.' },
  { id: 'productos', label: 'Productos / Servicios', icon: Package, tab: 'productos', match: ['/productos'], detail: 'Catalogo reutilizable para pedidos.' },
  { id: 'calendario', label: 'Calendario', icon: Calendar, tab: 'calendario', match: ['/calendario'], detail: 'Agenda y recordatorios.' },
  { id: 'cotizaciones', label: 'Cotizaciones', icon: FileSignature, tab: 'cotizaciones', match: ['/cotizaciones'], detail: 'Respuestas rapidas para leads.' },
  { id: 'pagos', label: 'Pagos', icon: CreditCard, tab: 'pagos', match: ['/pagos'], detail: 'Control de adelantos y saldos.' },
  { id: 'reportes', label: 'Reportes', icon: BarChart2, tab: 'reportes', match: ['/reportes'], premium: true, detail: 'Indicadores y tendencias.' },
  { id: 'configuracion', label: 'Configuración', icon: Settings, tab: 'configuracion', match: ['/configuracion'], detail: 'Preferencias y cuenta.' },
];

export const DEFAULT_MODULE_ORDER: ModuleId[] = DEFAULT_MODULES.map((m) => m.id);
