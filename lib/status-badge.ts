const BADGE_MAP: Record<string, string> = {
  Pendiente: 'badge-pendiente',
  Reserva: 'badge-reserva',
  Activo: 'badge-activo',
  'En camino': 'badge-en-camino',
  Entregado: 'badge-entregado',
  Cancelado: 'badge-cancelado',
  Aprobada: 'badge-aprobada',
  Adelanto: 'badge-adelanto',
  'No cancelado': 'badge-no-cancelado',
};

const BADGE_LABELS: Record<string, string> = {
  Pendiente: 'Pendiente',
  Reserva: 'Reservado',
  Activo: 'Activo',
  'En camino': 'En camino',
  Entregado: 'Entregado',
  Cancelado: 'Cancelado',
  Aprobada: 'Aprobada',
  Adelanto: 'Adelanto',
  'No cancelado': 'No cancelado',
};

export function getBadgeClass(status: string): string {
  return BADGE_MAP[status] ?? 'badge-pendiente';
}

export function getBadgeLabel(status: string): string {
  return BADGE_LABELS[status] ?? status;
}

export function getBadgeBgColor(status: string): string {
  switch (getBadgeClass(status)) {
    case 'badge-pendiente':
    case 'badge-reserva':
    case 'badge-adelanto':
      return '#fffbeb';
    case 'badge-activo':
      return '#eff6ff';
    case 'badge-en-camino':
      return '#fff7ed';
    case 'badge-entregado':
    case 'badge-aprobada':
      return '#ecfdf5';
    case 'badge-cancelado':
      return '#ecfdf5';
    case 'badge-no-cancelado':
      return '#fff1f2';
    default:
      return '#f8fafc';
  }
}

export function getBadgeTextColor(status: string): string {
  switch (getBadgeClass(status)) {
    case 'badge-pendiente':
    case 'badge-reserva':
    case 'badge-adelanto':
      return '#b45309';
    case 'badge-activo':
      return '#1d4ed8';
    case 'badge-en-camino':
      return '#c2410c';
    case 'badge-entregado':
    case 'badge-aprobada':
      return '#047857';
    case 'badge-cancelado':
      return '#047857';
    case 'badge-no-cancelado':
      return '#be123c';
    default:
      return '#334155';
  }
}

const BADGE_DEFAULTS = { className: getBadgeClass('Pendiente'), label: getBadgeLabel('Pendiente') };

export { BADGE_DEFAULTS };
