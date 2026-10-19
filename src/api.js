import axios from 'axios';

// All calls go to /api (proxied to http://localhost:8080 by Vite in development).
const api = axios.create({ baseURL: '/api' });

// Attach the JWT to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token missing/expired -> back to the login page.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

// Turns any axios error into a readable message.
export function errMsg(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) return 'Cannot reach the server. Is the backend running?';
  return error.message || 'Something went wrong';
}

export const today = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export const fmtDateTime = (v) => (v ? String(v).replace('T', ' ').slice(0, 19) : '');

export default api;
