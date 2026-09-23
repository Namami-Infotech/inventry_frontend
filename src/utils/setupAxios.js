import axios from 'axios';

/**
 * Checks if a JWT token is expired based on its payload exp claim.
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const { exp } = JSON.parse(jsonPayload);
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch (e) {
    return false;
  }
};

/**
 * Clears local session and redirects to /login if token is expired or unauthorized.
 */
export const logoutAndRedirectToLogin = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

/**
 * Initializes global Axios interceptors for handling auth headers and token expiration.
 */
export const setupAxiosInterceptors = () => {
  // Global Request Interceptor
  axios.interceptors.request.use(
    (config) => {
      config.withCredentials = true;
      const token = localStorage.getItem('authToken');
      if (token) {
        // If token has already expired locally, redirect immediately
        if (isTokenExpired(token)) {
          logoutAndRedirectToLogin();
          return Promise.reject(new Error('Session token expired.'));
        }
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Global Response Interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const { status, data } = error.response;
        const message = String(data?.message || '').toLowerCase();
        const isExpired = 
          status === 401 ||
          data?.isTokenExpired ||
          (status === 403 && (message.includes('token') || message.includes('expired') || message.includes('session')));

        if (isExpired) {
          console.warn('⚠️ Session expired or invalid. Redirecting to login...');
          logoutAndRedirectToLogin();
        }
      }
      return Promise.reject(error);
    }
  );
};
