const DEFAULT_API_PATH = '/api/v1';

type ApiTarget = 'auto' | 'local' | 'railway';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}


function normalizeApiPath(value: string): string {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return DEFAULT_API_PATH;
  }

  return trimmedValue.startsWith('/') ? trimmedValue : `/${trimmedValue}`;
}

function normalizeApiTarget(value: string | undefined): ApiTarget {
  const normalizedValue = value?.trim().toLowerCase();

  if (
    normalizedValue === 'local' ||
    normalizedValue === 'railway' ||
    normalizedValue === 'auto'
  ) {
    return normalizedValue;
  }

  return 'auto';
}

function buildConfiguredLocalBaseUrl(): string | null {
  const configuredHost = process.env.EXPO_PUBLIC_API_HOST?.trim();

  if (!configuredHost) {
    return null;
  }

  const protocol = process.env.EXPO_PUBLIC_API_SCHEME?.trim() || 'http';
  const port = process.env.EXPO_PUBLIC_API_PORT?.trim();
  const path = normalizeApiPath(process.env.EXPO_PUBLIC_API_PATH || DEFAULT_API_PATH);
  const hostWithPort = port ? `${configuredHost}:${port}` : configuredHost;

  return `${protocol}://${hostWithPort}${path}`;
}

function resolveRailwayBaseUrl(): string | null {
  const configuredRailwayBaseUrl = process.env.EXPO_PUBLIC_API_RAILWAY_BASE_URL?.trim();

  return configuredRailwayBaseUrl ? trimTrailingSlash(configuredRailwayBaseUrl) : null;
}

/**
 * Resuelve la base URL efectiva del backend segun las variables EXPO_PUBLIC_*.
 */
export function getApiBaseUrl(): string {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return trimTrailingSlash(configuredBaseUrl);
  }

  const configuredLocalBaseUrl = buildConfiguredLocalBaseUrl();
  const configuredRailwayBaseUrl = resolveRailwayBaseUrl();
  const apiTarget = normalizeApiTarget(process.env.EXPO_PUBLIC_API_TARGET);

  if (apiTarget === 'railway') {
    if (configuredRailwayBaseUrl) {
      return configuredRailwayBaseUrl;
    }

    throw new Error(
      'Falta EXPO_PUBLIC_API_RAILWAY_BASE_URL para usar EXPO_PUBLIC_API_TARGET=railway.',
    );
  }

  if (apiTarget === 'local') {
    if (configuredLocalBaseUrl) {
      return configuredLocalBaseUrl;
    }

    throw new Error(
      'Faltan EXPO_PUBLIC_API_HOST y variables locales para usar EXPO_PUBLIC_API_TARGET=local.',
    );
  }

  if (configuredLocalBaseUrl) {
    return configuredLocalBaseUrl;
  }

  if (configuredRailwayBaseUrl) {
    return configuredRailwayBaseUrl;
  }

  throw new Error(
    'Configura EXPO_PUBLIC_API_BASE_URL o define EXPO_PUBLIC_API_HOST / EXPO_PUBLIC_API_RAILWAY_BASE_URL.',
  );
}
