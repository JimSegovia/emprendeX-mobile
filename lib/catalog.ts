export type CatalogItemKind = 'Producto' | 'Servicio';

export type CatalogItem = {
  id: string;
  itemClass: 'Product' | 'Service';
  kind: CatalogItemKind;
  name: string;
  price: number;
  currencySymbol: string;
  description: string;
  sku?: string;
  unit?: string;
  category?: string;
  stock?: number;
  isActive: boolean;
  createdAt: string;
};

export type CatalogUnit = {
  unitId: string;
  unitName: string;
  abbreviation: string;
};

export type CatalogCategory = {
  categoryId: string;
  categoryName: string;
};

export type CreateCatalogItemPayload = {
  itemClass: 'Product' | 'Service';
  name: string;
  description?: string;
  sku?: string;
  price: string;
  unitId?: string;
  stock?: number;
  categoryId?: string;
};

type ApiCatalogItem = {
  id: string;
  itemClass: 'Product' | 'Service';
  name: string;
  description: string | null;
  sku: string | null;
  price: string;
  createdAt: string;
  product: {
    productId: string;
    stock: number;
    unit: {
      unitId: string;
      unitName: string;
      abbreviation: string;
    };
  } | null;
  service: {
    serviceId: string;
    category: {
      categoryId: string;
      categoryName: string;
    };
  } | null;
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

const DEFAULT_API_BASE_URL =
  'https://emprendex-backend-production.up.railway.app/api/v1';

function getApiBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  return configuredUrl || DEFAULT_API_BASE_URL;
}

function mapCatalogItem(item: ApiCatalogItem): CatalogItem {
  const kind = item.itemClass === 'Product' ? 'Producto' : 'Servicio';

  return {
    id: item.id,
    itemClass: item.itemClass,
    kind,
    name: item.name,
    price: Number(item.price),
    currencySymbol: 'S/',
    description: item.description ?? '',
    sku: item.sku ?? undefined,
    unit: item.product?.unit.unitName,
    category: item.service?.category.categoryName,
    stock: item.product?.stock,
    isActive: true,
    createdAt: item.createdAt,
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
): Promise<CatalogUnit[]> {
  return request<CatalogUnit[]>(accessToken, '/catalog/units', {
    method: 'GET',
  });
}

export async function fetchCatalogCategories(
  accessToken: string,
): Promise<CatalogCategory[]> {
  return request<CatalogCategory[]>(accessToken, '/catalog/categories', {
    method: 'GET',
  });
}

export async function fetchCatalogItems(
  accessToken: string,
): Promise<CatalogItem[]> {
  const items = await request<ApiCatalogItem[]>(accessToken, '/catalog/items', {
    method: 'GET',
  });

  return items.map(mapCatalogItem);
}

export async function fetchCatalogItemById(
  accessToken: string,
  itemId: string,
): Promise<CatalogItem> {
  const item = await request<ApiCatalogItem>(
    accessToken,
    `/catalog/items/${itemId}`,
    {
      method: 'GET',
    },
  );

  return mapCatalogItem(item);
}

export async function createCatalogItem(
  accessToken: string,
  payload: CreateCatalogItemPayload,
): Promise<CatalogItem> {
  const item = await request<ApiCatalogItem>(accessToken, '/catalog/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return mapCatalogItem(item);
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

export function formatMoney(currencySymbol: string, value: number) {
  return `${currencySymbol} ${value.toFixed(2)}`;
}
