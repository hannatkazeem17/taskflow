// These types mirror the backend contract from ARCHITECTURE.md.
// When the backend is ready, replace this file with generated types from openapi-typescript.

export interface ApiError {
  error: {
    code: string;
    message: string;
    details: unknown | null;
    request_id: string;
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}