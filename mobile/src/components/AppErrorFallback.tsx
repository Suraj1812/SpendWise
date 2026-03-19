import type { FallbackProps } from 'react-error-boundary';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { Screen } from './Screen';
import { fontFamilies } from '../constants/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAuthStore } from '../store/auth-store';

export const AppErrorFallback = ({ resetErrorBoundary }: FallbackProps) => {
  const theme = useAppTheme();
  const logout = useAuthStore((state) => state.logout);

  return (
    <Screen contentContainerStyle={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>SpendWise hit an unexpected error</Text>
        <Text style={[styles.message, { color: theme.colors.textMuted }]}>
          The safest next step is to retry the screen. If the issue keeps happening, reset the current session.
        </Text>
        <PrimaryButton onPress={resetErrorBoundary} title="Retry App" />
        <PrimaryButton
          onPress={() => {
            logout();
            resetErrorBoundary();
          }}
          title="Reset Session"
          variant="ghost"
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    padding: 24,
    width: '100%',
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: 22,
    lineHeight: 28,
  },
  message: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    lineHeight: 22,
  },
});

