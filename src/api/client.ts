import type { ApiError, AuthTokens } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// In-memory token store. Never put tokens in localStorage.
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(tokens: AuthTokens) {
  accessToken = tokens.access_token;
  refreshToken = tokens.refresh_token;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
}

export function getAccessToken() {
  return accessToken;
}

// A custom error class so the UI can read the error code.
export class ApiRequestError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as AuthTokens;
    setTokens(data);
    return true;
  } catch {
    return false;
  }
}

// The main request function.
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  let response = await fetch(url, { ...options, headers });

  // If the token expired, try to refresh once and retry.
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.set('Authorization', `Bearer ${accessToken}`);
      response = await fetch(url, { ...options, headers });
    } else {
      clearTokens();
      throw new ApiRequestError('UNAUTHORIZED', 'Session expired. Please log in again.', 401);
    }
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const err = data as ApiError;
    const code = err?.error?.code || 'UNKNOWN_ERROR';
    const message = err?.error?.message || 'Something went wrong.';
    throw new ApiRequestError(code, message, response.status);
  }

  return data as T;
}