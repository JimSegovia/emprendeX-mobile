import { apiRequest } from '@/lib/api-client';
import type { AuthUser } from '@/lib/auth';

export async function upgradeToPro(accessToken: string): Promise<AuthUser> {
  return apiRequest<AuthUser>('/subscriptions/upgrade', {
    method: 'POST',
  }, accessToken);
}

export async function downgradeToBasic(accessToken: string): Promise<AuthUser> {
  return apiRequest<AuthUser>('/subscriptions/downgrade', {
    method: 'POST',
  }, accessToken);
}
