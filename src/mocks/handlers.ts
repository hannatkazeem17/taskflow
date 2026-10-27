import { http, HttpResponse } from 'msw';

const API = '/api/v1';

// Fake user data
const fakeUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'student@oau.edu.ng',
  full_name: 'Test Student',
  avatar_url: null,
  is_active: true,
  created_at: new Date().toISOString(),
};

export const handlers = [
  // Login
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    if (body.email && body.password) {
      return HttpResponse.json({
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        token_type: 'bearer',
      });
    }
    return HttpResponse.json(
      { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', details: null, request_id: crypto.randomUUID() } },
      { status: 401 }
    );
  }),

  // Register
  http.post(`${API}/auth/register`, async () => {
    return HttpResponse.json({ ...fakeUser, message: 'Account created' }, { status: 201 });
  }),

  // Current user
  http.get(`${API}/users/me`, () => {
    return HttpResponse.json(fakeUser);
  }),

  // Refresh token
  http.post(`${API}/auth/refresh`, () => {
    return HttpResponse.json({
      access_token: 'fake-new-access-token',
      refresh_token: 'fake-new-refresh-token',
      token_type: 'bearer',
    });
  }),

  // Logout
  http.post(`${API}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out' });
  }),
];