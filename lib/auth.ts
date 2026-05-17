import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ModuleId } from '@/lib/modules';

const AUTH_STORAGE_KEY = 'emprendex:auth:v1';
const DEFAULT_API_BASE_URL =
  'https://emprendex-backend-production.up.railway.app/api/v1';

export type AuthUser = {
  id: string;
  email: string;
  onboardingCompleted: boolean;
  enabledModuleIds: ModuleId[];
  businessProfile: {
    name: string | null;
    category: string | null;
    currencyCode: string | null;
  };
};

export type AuthStateResponse = Pick<
  AuthSessionResponse,
  'requiresOnboarding' | 'user'
>;

export type AuthSessionResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  requiresOnboarding: boolean;
  user: AuthUser;
};

type StoredAuthSession = Pick<AuthSessionResponse, 'accessToken' | 'tokenType'>;

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  businessName: string;
  businessCategory: string;
  currencyCode: 'PEN';
};

type OnboardingSetupPayload = {
  businessName: string;
  businessCategory: string;
  currencyCode: 'PEN';
};

type OnboardingModulesPayload = {
  selectedModuleIds: ModuleId[];
};

type ApiErrorBody = {
  message?: string | string[];
};

type JsonObject = Record<string, unknown>;

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function getApiBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  return configuredUrl || DEFAULT_API_BASE_URL;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!isJsonObject(value) || !isJsonObject(value.businessProfile)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.email === 'string' &&
    typeof value.onboardingCompleted === 'boolean' &&
    isStringArray(value.enabledModuleIds) &&
    isNullableString(value.businessProfile.name) &&
    isNullableString(value.businessProfile.category) &&
    isNullableString(value.businessProfile.currencyCode)
  );
}

function isAuthStateResponse(value: unknown): value is AuthStateResponse {
  return (
    isJsonObject(value) &&
    typeof value.requiresOnboarding === 'boolean' &&
    isAuthUser(value.user)
  );
}

function isAuthSessionResponse(value: unknown): value is AuthSessionResponse {
  if (!isAuthStateResponse(value)) {
    return false;
  }

  const session = value as Partial<AuthSessionResponse>;

  return (
    typeof session.accessToken === 'string' &&
    session.tokenType === 'Bearer' &&
    typeof session.expiresIn === 'number'
  );
}

function parseResponseBody(rawBody: string): unknown {
  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new Error('El servidor respondio con un formato inválido.');
  }
}

function assertAuthSessionResponse(
  payload: unknown,
): asserts payload is AuthSessionResponse {
  if (!isAuthSessionResponse(payload)) {
    throw new Error('El login devolvio una respuesta con formato inesperado.');
  }
}

function assertAuthStatePayload(
  payload: unknown,
): asserts payload is AuthStateResponse {
  if (!isAuthStateResponse(payload)) {
    throw new Error('El servidor devolvio un estado de sesión inválido.');
  }
}

function isLikelyNetworkErrorMessage(message: string): boolean {
  const normalizedMessage = message.trim().toLowerCase();

  return (
    normalizedMessage.includes('network request failed') ||
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('load failed') ||
    normalizedMessage.includes('networkerror')
  );
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const rawBody = await response.text();
  const payload = parseResponseBody(rawBody);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload), response.status);
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

export async function loginUser(
  payload: LoginPayload,
): Promise<AuthSessionResponse> {
  const session = await request<unknown>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  assertAuthSessionResponse(session);
  return session;
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthSessionResponse> {
  const session = await request<unknown>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  assertAuthSessionResponse(session);
  return session;
}

export async function fetchCurrentUser(
  accessToken: string,
): Promise<AuthStateResponse> {
  const authState = await request<unknown>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  assertAuthStatePayload(authState);
  return authState;
}

export async function updateOnboardingSetup(
  accessToken: string,
  payload: OnboardingSetupPayload,
): Promise<AuthStateResponse> {
  return request<AuthStateResponse>('/onboarding/setup', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function completeOnboardingModules(
  accessToken: string,
  payload: OnboardingModulesPayload,
): Promise<AuthStateResponse> {
  return request<AuthStateResponse>('/onboarding/modules', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function saveAuthSession(
  session: AuthSessionResponse,
): Promise<void> {
  const authSession: StoredAuthSession = {
    accessToken: session.accessToken,
    tokenType: session.tokenType,
  };

  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
}

export async function loadAuthSession(): Promise<StoredAuthSession | null> {
  try {
    const rawSession = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    return JSON.parse(rawSession) as StoredAuthSession;
  } catch {
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}

export function resolvePostAuthRoute(session: {
  requiresOnboarding: boolean;
  user: AuthUser;
}): '/onboarding' | '/onboarding/modules' | '/(drawer)/(tabs)' {
  if (!session.requiresOnboarding) {
    return '/(drawer)/(tabs)';
  }

  const hasBusinessProfile = Boolean(
    session.user.businessProfile.name &&
      session.user.businessProfile.category &&
      session.user.businessProfile.currencyCode,
  );

  return hasBusinessProfile ? '/onboarding/modules' : '/onboarding';
}

export function getReadableAuthError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Correo o contraseña incorrectos.';
    }

    if (error.status === 409) {
      return 'Ese correo ya está registrado.';
    }

    return error.message;
  }

  if (error instanceof Error) {
    if (isLikelyNetworkErrorMessage(error.message)) {
      return 'No se pudo conectar con el servidor. Intenta de nuevo.';
    }

    return error.message || 'No se pudo completar la solicitud.';
  }

  return 'No se pudo conectar con el servidor. Intenta de nuevo.';
}
