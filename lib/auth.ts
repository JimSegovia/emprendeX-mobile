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
  email: string;
  password: string;
  businessName: string;
  businessCategory: string;
  currencyCode: 'PEN' | 'USD' | 'MXN' | 'EUR';
};

type OnboardingSetupPayload = {
  businessName: string;
  businessCategory: string;
  currencyCode: 'PEN' | 'USD' | 'MXN' | 'EUR';
};

type OnboardingModulesPayload = {
  selectedModuleIds: ModuleId[];
};

type ApiErrorBody = {
  message?: string | string[];
};

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
  const payload: unknown = rawBody ? JSON.parse(rawBody) : null;

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
  return request<AuthSessionResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthSessionResponse> {
  return request<AuthSessionResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentUser(
  accessToken: string,
): Promise<AuthStateResponse> {
  return request<AuthStateResponse>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
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

  return 'No se pudo conectar con el servidor. Intenta de nuevo.';
}
