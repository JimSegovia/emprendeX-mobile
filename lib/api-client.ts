type ApiErrorBody = {
  message?: string | string[];
};

import { getApiBaseUrl } from '@/lib/api-config';

/**
 * Error normalizado para respuestas HTTP no exitosas del backend.
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/**
 * Ejecuta una solicitud JSON contra la API mobile y unifica headers, parsing y errores.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit,
  accessToken?: string,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
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
  } catch {
    throw new ApiClientError(
      'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      0,
    );
  }

  const rawBody = await response.text();
  const payload = rawBody ? (JSON.parse(rawBody) as unknown) : null;

  if (!response.ok) {
    throw new ApiClientError(getErrorMessage(payload), response.status);
  }

  return payload as T;
}

/**
 * Extrae un mensaje legible desde el payload de error devuelto por el backend.
 */
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

/**
 * Convierte errores tecnicos o HTTP en un mensaje apto para mostrar en UI.
 */
export function getReadableApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'No se pudo conectar con el servidor. Intenta de nuevo.';
}
