import { apiRequest, getReadableApiError } from '@/lib/api-client';

export type Plan = {
  id: string;
  name: string;
  description: string;
  status: string;
  prices: Array<{
    id: string;
    period: string;
    price: string;
    isActive: boolean;
  }>;
};

export async function fetchPlanes(accessToken: string) {
  return apiRequest<Plan[]>('/planes', { method: 'GET' }, accessToken);
}

export { getReadableApiError as getReadablePlanesError };
