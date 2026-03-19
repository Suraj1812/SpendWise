import axios from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/auth-store';

const normalizeBaseUrl = (value: string) => {
  const trimmed = value.endsWith('/') ? value.slice(0, -1) : value;
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api';
  }

  return 'http://127.0.0.1:4000/api';
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message ?? error.message;
  }

  return 'Something went wrong. Please try again.';
};

