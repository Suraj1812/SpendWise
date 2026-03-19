import { StyleSheet, Text, View } from 'react-native';
import { fontFamilies } from '../constants/theme';
import { useAppTheme } from '../hooks/useAppTheme';
import { PrimaryButton } from './PrimaryButton';

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text>
      {onRetry ? <PrimaryButton onPress={onRetry} title="Try Again" /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    padding: 22,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: 18,
  },
  message: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    lineHeight: 22,
  },
});

