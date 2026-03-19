import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fontFamilies } from '../constants/theme';
import { useAppTheme } from '../hooks/useAppTheme';

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export const SectionCard = ({ title, subtitle, children }: SectionCardProps) => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      {title ? <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text> : null}
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 1,
    shadowRadius: 24,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: 18,
  },
  subtitle: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    marginTop: 6,
  },
  content: {
    gap: 14,
    marginTop: 16,
  },
});

