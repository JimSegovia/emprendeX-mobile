export type ProductosServiciosItemKind = 'Producto' | 'Servicio';

export type ProductosServiciosItem = {
  id: string;
  itemClass: 'Producto' | 'Servicio';
  kind: ProductosServiciosItemKind;
  referenceCode: string;
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

export type UnidadProductoServicio = {
  unitId: string;
  unitName: string;
  abbreviation: string;
};

export type CategoriaProductoServicio = {
  categoryId: string;
  categoryName: string;
};

export type CrearProductoServicioPayload = {
  itemClass: 'Producto' | 'Servicio';
  name: string;
  description?: string;
  sku?: string;
  price: string;
  unitId?: string;
  unitName?: string;
  stock?: number;
  categoryId?: string;
  categoryName?: string;
};

export type ActualizarProductoServicioPayload = Partial<CrearProductoServicioPayload>;

type ApiItem = {
  id: string;
  itemClass: 'Producto' | 'Servicio';
  referenceCode: string;
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

class ProductosServiciosApiError extends Error {
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

function mapProductoServicioItem(item: ApiItem): ProductosServiciosItem {
  const kind = item.itemClass === 'Producto' ? 'Producto' : 'Servicio';

  return {
    id: item.id,
    itemClass: item.itemClass,
    kind,
    referenceCode: item.referenceCode,
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
    throw new ProductosServiciosApiError(getErrorMessage(payload), response.status);
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

export async function fetchProductosServiciosUnits(
  accessToken: string,
): Promise<UnidadProductoServicio[]> {
  return request<UnidadProductoServicio[]>(
    accessToken,
    '/productos-servicios/units',
    {
      method: 'GET',
    },
  );
}

export async function fetchProductosServiciosCategories(
  accessToken: string,
): Promise<CategoriaProductoServicio[]> {
  return request<CategoriaProductoServicio[]>(
    accessToken,
    '/productos-servicios/categories',
    {
      method: 'GET',
    },
  );
}

export async function fetchProductosServiciosItems(
  accessToken: string,
): Promise<ProductosServiciosItem[]> {
  const items = await request<ApiItem[]>(accessToken, '/productos-servicios/items', {
    method: 'GET',
  });

  return items.map(mapProductoServicioItem);
}

export async function fetchProductosServiciosItemById(
  accessToken: string,
  itemId: string,
): Promise<ProductosServiciosItem> {
  const item = await request<ApiItem>(
    accessToken,
    `/productos-servicios/items/${itemId}`,
    {
      method: 'GET',
    },
  );

  return mapProductoServicioItem(item);
}

export async function createProductoServicio(
  accessToken: string,
  payload: CrearProductoServicioPayload,
): Promise<ProductosServiciosItem> {
  const item = await request<ApiItem>(accessToken, '/productos-servicios/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return mapProductoServicioItem(item);
}

export async function updateProductoServicio(
  accessToken: string,
  itemId: string,
  payload: ActualizarProductoServicioPayload,
): Promise<ProductosServiciosItem> {
  const item = await request<ApiItem>(
    accessToken,
    `/productos-servicios/items/${itemId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );

  return mapProductoServicioItem(item);
}

export async function deleteProductoServicio(
  accessToken: string,
  itemId: string,
): Promise<void> {
  await request<null>(accessToken, `/productos-servicios/items/${itemId}`, {
    method: 'DELETE',
  });
}

export function getReadableProductosServiciosError(error: unknown): string {
  if (error instanceof ProductosServiciosApiError) {
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
