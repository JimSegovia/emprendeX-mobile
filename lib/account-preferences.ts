import AsyncStorage from '@react-native-async-storage/async-storage';

export type ColorPaletteId =
  | 'violet'
  | 'ocean'
  | 'forest'
  | 'ember'
  | 'rose'
  | 'slate'
  | 'graphite'
  | 'sand';

export type ColorPalette = {
  id: ColorPaletteId;
  label: string;
  description: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  primaryBorder: string;
  primaryText: string;
  primaryMutedText: string;
  shadow: string;
};

const STORAGE_KEY = 'emprendex:accountPrefs:v1';

export const DEFAULT_COLOR_PALETTE_ID: ColorPaletteId = 'violet';

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'violet',
    label: 'Violeta',
    description: 'La identidad actual de EmprendeX.',
    primary: '#7c3aed',
    primaryDark: '#6d28d9',
    primarySoft: '#f5f3ff',
    primaryBorder: '#ddd6fe',
    primaryText: '#6d28d9',
    primaryMutedText: '#ede9fe',
    shadow: '#c4b5fd',
  },
  {
    id: 'ocean',
    label: 'Océano',
    description: 'Azules limpios y profesionales.',
    primary: '#0284c7',
    primaryDark: '#0369a1',
    primarySoft: '#e0f2fe',
    primaryBorder: '#bae6fd',
    primaryText: '#0369a1',
    primaryMutedText: '#e0f2fe',
    shadow: '#7dd3fc',
  },
  {
    id: 'forest',
    label: 'Bosque',
    description: 'Verdes serenos para gestión diaria.',
    primary: '#059669',
    primaryDark: '#047857',
    primarySoft: '#d1fae5',
    primaryBorder: '#a7f3d0',
    primaryText: '#047857',
    primaryMutedText: '#d1fae5',
    shadow: '#6ee7b7',
  },
  {
    id: 'ember',
    label: 'Ámbar',
    description: 'Cálida, directa y comercial.',
    primary: '#d97706',
    primaryDark: '#b45309',
    primarySoft: '#fef3c7',
    primaryBorder: '#fde68a',
    primaryText: '#b45309',
    primaryMutedText: '#fef3c7',
    shadow: '#fcd34d',
  },
  {
    id: 'rose',
    label: 'Rosa',
    description: 'Vibrante para marcas expresivas.',
    primary: '#e11d48',
    primaryDark: '#be123c',
    primarySoft: '#ffe4e6',
    primaryBorder: '#fecdd3',
    primaryText: '#be123c',
    primaryMutedText: '#ffe4e6',
    shadow: '#fda4af',
  },
  {
    id: 'slate',
    label: 'Pizarra',
    description: 'Neutra, moderna y sobria.',
    primary: '#475569',
    primaryDark: '#334155',
    primarySoft: '#f1f5f9',
    primaryBorder: '#cbd5e1',
    primaryText: '#334155',
    primaryMutedText: '#e2e8f0',
    shadow: '#cbd5e1',
  },
  {
    id: 'graphite',
    label: 'Grafito',
    description: 'Oscura, elegante y minimalista.',
    primary: '#3f3f46',
    primaryDark: '#27272a',
    primarySoft: '#f4f4f5',
    primaryBorder: '#d4d4d8',
    primaryText: '#27272a',
    primaryMutedText: '#e4e4e7',
    shadow: '#d4d4d8',
  },
  {
    id: 'sand',
    label: 'Arena',
    description: 'Cálida y neutral para un look suave.',
    primary: '#a16207',
    primaryDark: '#854d0e',
    primarySoft: '#fef3c7',
    primaryBorder: '#fde68a',
    primaryText: '#854d0e',
    primaryMutedText: '#fef3c7',
    shadow: '#fcd34d',
  },
];

export type AccountPreferences = {
  colorPaletteId: ColorPaletteId;
  logoUrl: string | null;
};

function isColorPaletteId(value: unknown): value is ColorPaletteId {
  return COLOR_PALETTES.some((palette) => palette.id === value);
}

export function getColorPalette(id: ColorPaletteId): ColorPalette {
  return COLOR_PALETTES.find((palette) => palette.id === id) ?? COLOR_PALETTES[0];
}

export async function loadAccountPreferences(): Promise<AccountPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<AccountPreferences>) : null;

    return {
      colorPaletteId: isColorPaletteId(parsed?.colorPaletteId)
        ? parsed.colorPaletteId
        : DEFAULT_COLOR_PALETTE_ID,
      logoUrl: typeof parsed?.logoUrl === 'string' ? parsed.logoUrl : null,
    };
  } catch {
    return { colorPaletteId: DEFAULT_COLOR_PALETTE_ID, logoUrl: null };
  }
}

export async function saveAccountPreferences(preferences: AccountPreferences): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
