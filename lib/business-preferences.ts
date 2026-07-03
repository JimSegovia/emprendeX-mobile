import { apiRequest, getReadableApiError } from '@/lib/api-client';
import { getApiBaseUrl } from '@/lib/api-config';
import { copyAssetToLocal } from '@/lib/asset-utils';
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
  const localUri = await copyAssetToLocal(imageUri);
  const filename = localUri.split('/').pop() || 'logo.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const formData = new FormData();
  formData.append('logo', {
    uri: localUri,
    name: `logo-${Date.now()}.${ext}`,
    type: mimeType,
  } as unknown as Blob);

  const response = await fetch(`${getApiBaseUrl()}/business/preferences/logo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data) {
    throw new Error(
      data?.message || `Error al subir el logo (${response.status})`,
    );
  }

  return data as BusinessPreferences;
}

export { getReadableApiError as getReadableBusinessPreferencesError };
