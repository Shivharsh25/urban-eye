import axios from 'axios';

const API_BASE_URL = '';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
});

// Request Interceptor: Attach JWT token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('urban_eye_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 unauthorized
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on auth expiry
      localStorage.removeItem('urban_eye_token');
      localStorage.removeItem('urban_eye_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
export { API_BASE_URL };
