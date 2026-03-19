import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { fontFamilies } from '../constants/theme';
import { useAppTheme } from '../hooks/useAppTheme';

type LoadingViewProps = {
  label?: string;
};

export const LoadingView = ({ label = 'Loading SpendWise...' }: LoadingViewProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.colors.primary} size="large" />
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: {
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    marginTop: 16,
    textAlign: 'center',
  },
});

