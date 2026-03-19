import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from 'react-error-boundary';
import { AppErrorFallback } from './src/components/AppErrorFallback';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashView } from './src/components/SplashView';
import { useAuthStore } from './src/store/auth-store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const themeMode = useAuthStore((state) => state.themeMode);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsBootstrapped(true);
    }, 1800);

    return () => clearTimeout(timeout);
  }, []);

  if (!fontsLoaded || !hasHydrated || !isBootstrapped) {
    return <SplashView />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
          <ErrorBoundary FallbackComponent={AppErrorFallback}>
            <AppNavigator />
          </ErrorBoundary>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = {
  root: {
    flex: 1,
  },
};
