import { apiRequest, getReadableApiError } from '@/lib/api-client';
import type { ColorPaletteId } from '@/lib/account-preferences';

export type BusinessPreferences = {
  businessPreferenceId: string;
  businessId: string;
  colorPaletteId: ColorPaletteId;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateBusinessPreferencesPayload = {
  colorPaletteId?: ColorPaletteId;
  logoUrl?: string | null;
};

export async function fetchBusinessPreferences(accessToken: string) {
  return apiRequest<BusinessPreferences>('/business/preferences', { method: 'GET' }, accessToken);
}

export async function updateBusinessPreferences(
  accessToken: string,
  payload: UpdateBusinessPreferencesPayload,
) {
  return apiRequest<BusinessPreferences>(
    '/business/preferences',
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export { getReadableApiError as getReadableBusinessPreferencesError };
