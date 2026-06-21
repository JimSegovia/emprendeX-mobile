import { getApiBaseUrl } from '@/lib/api-config';
import { DEFAULT_CURRENCY_SYMBOL, formatCurrencyAmount } from '@/lib/runtime-config';

export type CatalogItemKind = 'Producto' | 'Servicio';

export type CatalogItemReference = {
  id: string;
  name: string;
  itemClass: CatalogItemKind;
};

export type CatalogItem = {
  id: string;
  itemClass: CatalogItemKind;
  kind: CatalogItemKind;
  referenceCode: string;
  name: string;
  imageUrl: string | null;
  price: number;
  currencySymbol: string;
  description: string;
  sku?: string;
  unit: CatalogItemReference;
  category: CatalogItemReference;
  stock: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CatalogUnit = {
  unitId: string;
  businessId: string;
  itemClass: CatalogItemKind;
  unitName: string;
  createdAt: string;
  updatedAt: string;
};

export type CatalogCategory = {
  categoryId: string;
  businessId: string;
  itemClass: CatalogItemKind;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCatalogUnitPayload = {
  itemClass: CatalogItemKind;
  unitName: string;
};

export type UpdateCatalogUnitPayload = Partial<Pick<CreateCatalogUnitPayload, 'unitName'>>;

export type CreateCatalogCategoryPayload = {
  itemClass: CatalogItemKind;
  categoryName: string;
};

export type UpdateCatalogCategoryPayload = Partial<
  Pick<CreateCatalogCategoryPayload, 'categoryName'>
>;

export type CreateCatalogItemPayload = {
  itemClass: CatalogItemKind;
  name: string;
  description?: string;
  sku?: string;
  price: string;
  unitId: string;
  categoryId: string;
  stock?: number;
};

export type UpdateCatalogItemPayload = Partial<CreateCatalogItemPayload>;

type ApiCatalogReference = {
  id: string;
  name: string;
  itemClass: CatalogItemKind;
};

type ApiItem = {
  id: string;
  businessId: string;
  itemClass: CatalogItemKind;
  name: string;
  description: string | null;
  sku: string | null;
  referenceCode: string;
  imageUrl: string | null;
  image_url?: string | null;
  price: string;
  category: ApiCatalogReference;
  unit: ApiCatalogReference;
  stock: number | null;
  createdAt: string;
  updatedAt: string;
};

type ApiErrorBody = {
  message?: string | string[];
};

class CatalogApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function mapCatalogItem(item: ApiItem): CatalogItem {
  const kind = item.itemClass === 'Producto' ? 'Producto' : 'Servicio';

  return {
    id: item.id,
    itemClass: item.itemClass,
    kind,
    referenceCode: item.referenceCode,
    name: item.name,
    imageUrl: item.imageUrl ?? item.image_url ?? null,
    price: Number(item.price),
    currencySymbol: DEFAULT_CURRENCY_SYMBOL,
    description: item.description ?? '',
    sku: item.sku ?? undefined,
    unit: item.unit,
    category: item.category,
    stock: item.stock,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function request<T>(
  accessToken: string,
  path: string,
  options: RequestInit,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers ?? {}),
    },
  });

  const rawBody = await response.text();
  const payload = rawBody ? (JSON.parse(rawBody) as unknown) : null;

  if (!response.ok) {
    throw new CatalogApiError(getErrorMessage(payload), response.status);
  }

  return payload as T;
}

function getErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object' || !('message' in payload)) {
    return 'No se pudo completar la solicitud.';
  }

  const { message } = payload as ApiErrorBody;

  if (Array.isArray(message)) {
    return message[0] ?? 'No se pudo completar la solicitud.';
  }

  return message ?? 'No se pudo completar la solicitud.';
}

export async function fetchCatalogUnits(
  accessToken: string,
  itemClass: CatalogItemKind,
): Promise<CatalogUnit[]> {
  return request<CatalogUnit[]>(
    accessToken,
    `/catalogo/units?itemClass=${encodeURIComponent(itemClass)}`,
    { method: 'GET' },
  );
}

export async function fetchCatalogCategories(
  accessToken: string,
  itemClass: CatalogItemKind,
): Promise<CatalogCategory[]> {
  return request<CatalogCategory[]>(
    accessToken,
    `/catalogo/categories?itemClass=${encodeURIComponent(itemClass)}`,
    { method: 'GET' },
  );
}

export async function createCatalogUnit(
  accessToken: string,
  payload: CreateCatalogUnitPayload,
): Promise<CatalogUnit> {
  return request<CatalogUnit>(accessToken, '/catalogo/units', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCatalogUnit(
  accessToken: string,
  unitId: string,
  payload: UpdateCatalogUnitPayload,
): Promise<CatalogUnit> {
  return request<CatalogUnit>(accessToken, `/catalogo/units/${unitId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteCatalogUnit(accessToken: string, unitId: string): Promise<void> {
  await request<null>(accessToken, `/catalogo/units/${unitId}`, {
    method: 'DELETE',
  });
}

export async function createCatalogCategory(
  accessToken: string,
  payload: CreateCatalogCategoryPayload,
): Promise<CatalogCategory> {
  return request<CatalogCategory>(accessToken, '/catalogo/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCatalogCategory(
  accessToken: string,
  categoryId: string,
  payload: UpdateCatalogCategoryPayload,
): Promise<CatalogCategory> {
  return request<CatalogCategory>(accessToken, `/catalogo/categories/${categoryId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteCatalogCategory(
  accessToken: string,
  categoryId: string,
): Promise<void> {
  await request<null>(accessToken, `/catalogo/categories/${categoryId}`, {
    method: 'DELETE',
  });
}

export async function fetchCatalogItems(accessToken: string): Promise<CatalogItem[]> {
  const items = await request<ApiItem[]>(accessToken, '/catalogo/items', {
    method: 'GET',
  });

  return items.map(mapCatalogItem);
}

export async function fetchCatalogItemById(
  accessToken: string,
  itemId: string,
): Promise<CatalogItem> {
  const item = await request<ApiItem>(accessToken, `/catalogo/items/${itemId}`, {
    method: 'GET',
  });

  return mapCatalogItem(item);
}

export async function createCatalogItem(
  accessToken: string,
  payload: CreateCatalogItemPayload,
): Promise<CatalogItem> {
  const item = await request<ApiItem>(accessToken, '/catalogo/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return mapCatalogItem(item);
}

export async function updateCatalogItem(
  accessToken: string,
  itemId: string,
  payload: UpdateCatalogItemPayload,
): Promise<CatalogItem> {
  const item = await request<ApiItem>(accessToken, `/catalogo/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return mapCatalogItem(item);
}

export async function deleteCatalogItem(accessToken: string, itemId: string): Promise<void> {
  await request<null>(accessToken, `/catalogo/items/${itemId}`, {
    method: 'DELETE',
  });
}

export function getReadableCatalogError(error: unknown): string {
  if (error instanceof CatalogApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'No se pudo conectar con el servidor. Intenta de nuevo.';
}

export async function uploadCatalogImage(
  accessToken: string,
  itemId: string,
  imageUri: string,
): Promise<CatalogItem> {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  formData.append('image', {
    uri: imageUri,
    name: `catalog-${itemId}-${Date.now()}.${ext}`,
    type: mimeType,
  } as unknown as Blob);

  const response = await fetch(`${getApiBaseUrl()}/catalogo/items/${itemId}/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      // Content-Type is omitted so fetch sets multipart/form-data with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const rawBody = await response.text();
    const payload = rawBody ? (JSON.parse(rawBody) as unknown) : null;
    throw new CatalogApiError(getErrorMessage(payload), response.status);
  }

  const rawBody = await response.text();
  return mapCatalogItem(rawBody ? (JSON.parse(rawBody) as ApiItem) : ({} as ApiItem));
}

export async function deleteCatalogImage(
  accessToken: string,
  itemId: string,
): Promise<void> {
  const response = await fetch(
    `${getApiBaseUrl()}/catalogo/items/${itemId}/image`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const rawBody = await response.text();
    const payload = rawBody ? (JSON.parse(rawBody) as unknown) : null;
    throw new CatalogApiError(getErrorMessage(payload), response.status);
  }
}

export function formatMoney(currencySymbol: string, value: number) {
  return formatCurrencyAmount(value, currencySymbol);
}
