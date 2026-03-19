import { createTheme } from '../constants/theme';
import { useAuthStore } from '../store/auth-store';

export const useAppTheme = () => {
  const mode = useAuthStore((state) => state.themeMode);
  return createTheme(mode);
};

