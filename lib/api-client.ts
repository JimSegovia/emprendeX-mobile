type ApiErrorBody = {
  message?: string | string[];
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const DEFAULT_API_BASE_URL = 'https://emprendex-backend-production.up.railway.app/api/v1';

export function getApiBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  return configuredUrl || DEFAULT_API_BASE_URL;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit,
  accessToken?: string,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {}),
      ...(options.headers ?? {}),
    },
  });

  const rawBody = await response.text();
  const payload = rawBody ? (JSON.parse(rawBody) as unknown) : null;

  if (!response.ok) {
    throw new ApiClientError(getErrorMessage(payload), response.status);
  }

  return payload as T;
}

export function getErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object' || !('message' in payload)) {
    return 'No se pudo completar la solicitud.';
  }

  const { message } = payload as ApiErrorBody;

  if (Array.isArray(message)) {
    return message[0] ?? 'No se pudo completar la solicitud.';
  }

  return message ?? 'No se pudo completar la solicitud.';
}

export function getReadableApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'No se pudo conectar con el servidor. Intenta de nuevo.';
}
