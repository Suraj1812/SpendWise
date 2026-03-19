import axios from 'axios';
import { NativeModules, Platform } from 'react-native';
import { useAuthStore } from '../store/auth-store';

const normalizeBaseUrl = (value: string) => {
  const trimmed = value.endsWith('/') ? value.slice(0, -1) : value;
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

type SourceCodeModule = {
  getConstants?: () => {
    scriptURL?: string;
  };
  scriptURL?: string;
};

const getDevServerHost = () => {
  const sourceCode = NativeModules.SourceCode as SourceCodeModule | undefined;
  const scriptUrl = sourceCode?.getConstants?.().scriptURL ?? sourceCode?.scriptURL;
  const host = scriptUrl?.match(/^https?:\/\/([^/:]+)(?::\d+)?\//)?.[1];

  if (!host) {
    return null;
  }

  if (Platform.OS === 'android' && ['127.0.0.1', 'localhost'].includes(host)) {
    return '10.0.2.2';
  }

  return host;
};

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
  }

  const devServerHost = getDevServerHost();

  if (devServerHost) {
    return normalizeBaseUrl(`http://${devServerHost}:4000`);
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
    if (!error.response) {
      return "Couldn't reach the SpendWise API. Start the server and keep your phone and laptop on the same Wi-Fi.";
    }

    return (error.response?.data as { message?: string } | undefined)?.message ?? error.message;
  }

  return 'Something went wrong. Please try again.';
};
