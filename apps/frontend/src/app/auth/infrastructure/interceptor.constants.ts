export const AUTH_LOGIN_ENDPOINT = '/api/auth/login';
export const AUTH_SETUP_ENDPOINT = '/api/auth/complete-setup';
export const AUTH_REFRESH_ENDPOINT = '/api/auth/refresh';
export const AUTH_LOGOUT_ENDPOINT = '/api/auth/logout';

/**
 * List of endpoints that are part of the initial login flow.
 * A 401 on these is just a "failed login," not a session error.
 * The interceptor should just let the error pass through.
 */
const AUTH_LOGIN_ENDPOINTS = [AUTH_LOGIN_ENDPOINT, AUTH_SETUP_ENDPOINT];

/**
 * List of endpoints that are "final failure" points.
 * A 401 on these means the session is definitively dead,
 * and the interceptor must trigger a logout.
 */
const AUTH_FINAL_FAILURE_ENDPOINTS = [AUTH_REFRESH_ENDPOINT, AUTH_LOGOUT_ENDPOINT];

/**
 * Checks if a URL is part of the login flow.
 */
export function isAuthLoginEndpoint(url: string): boolean {
  return AUTH_LOGIN_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

/**
 * Checks if a 401 on this URL should trigger a final logout.
 */
export function isAuthFinalFailureEndpoint(url: string): boolean {
  return AUTH_FINAL_FAILURE_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}
