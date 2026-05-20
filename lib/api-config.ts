const DEFAULT_API_BASE_URL = 'https://emprendex-backend-production.up.railway.app/api/v1';
const DEFAULT_API_PATH = '/api/v1';

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

export function getApiBaseUrl(): string {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return trimTrailingSlash(configuredBaseUrl);
  }

  const configuredHost = process.env.EXPO_PUBLIC_API_HOST?.trim();

  if (!configuredHost) {
    return DEFAULT_API_BASE_URL;
  }

  const protocol = process.env.EXPO_PUBLIC_API_SCHEME?.trim() || 'http';
  const port = process.env.EXPO_PUBLIC_API_PORT?.trim();
  const path = normalizeApiPath(process.env.EXPO_PUBLIC_API_PATH || DEFAULT_API_PATH);
  const hostWithPort = port ? `${configuredHost}:${port}` : configuredHost;

  return `${protocol}://${hostWithPort}${path}`;
}
