import { apiRequest, getReadableApiError } from '@/lib/api-client';
import { getApiBaseUrl } from '@/lib/api-config';
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

export async function uploadBusinessLogo(
  accessToken: string,
  imageUri: string,
): Promise<BusinessPreferences> {
  const filename = imageUri.split('/').pop() || 'logo.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const formData = new FormData();
  formData.append('logo', {
    uri: imageUri,
    name: `logo-${Date.now()}.${ext}`,
    type: mimeType,
  } as unknown as Blob);

  const response = await fetch(`${getApiBaseUrl()}/business/preferences/logo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al subir el logo');
  }

  return response.json() as Promise<BusinessPreferences>;
}

export { getReadableApiError as getReadableBusinessPreferencesError };
