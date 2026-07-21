import axios from 'axios';

const deliveryApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/delivery`,
  headers: { 'Content-Type': 'application/json' },
});

deliveryApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('indiwari_delivery_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

deliveryApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('indiwari_delivery_token');
      sessionStorage.removeItem('indiwari_delivery_person');
      if (window.location.pathname !== '/delivery/login') {
        window.location.href = '/delivery/login';
      }
    }
    return Promise.reject(error);
  }
);

export default deliveryApi;
