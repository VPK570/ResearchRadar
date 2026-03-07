import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for injecting JWT
client.interceptors.request.use(
  (config) => {
    const token = window.sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for catching 401s
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      window.sessionStorage.removeItem('token');
      // In a real app we'd trigger a logout from context or redirect
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
