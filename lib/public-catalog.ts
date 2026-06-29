import { apiRequest, getReadableApiError } from '@/lib/api-client';

export type BusinessPublicCatalogSettings = {
  businessId: string;
  businessName: string;
  publicCatalogSlug: string;
  catalogIsPublic: boolean;
  publicCatalogUrl: string;
};

type UpdateBusinessPublicCatalogPayload = {
  publicCatalogSlug?: string;
  catalogIsPublic?: boolean;
};

export async function fetchBusinessPublicCatalog(accessToken: string) {
  return apiRequest<BusinessPublicCatalogSettings>(
    '/negocios/mi-catalogo-publico',
    { method: 'GET' },
    accessToken,
  );
}

export async function updateBusinessPublicCatalog(
  accessToken: string,
  payload: UpdateBusinessPublicCatalogPayload,
) {
  return apiRequest<BusinessPublicCatalogSettings>(
    '/negocios/mi-catalogo-publico',
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export function createPublicCatalogSharePayload(url: string, message: string) {
  return {
    title: 'Compartir catálogo',
    message: `${message}\n\n${url}`,
  };
}

export { getReadableApiError as getReadablePublicCatalogError };
