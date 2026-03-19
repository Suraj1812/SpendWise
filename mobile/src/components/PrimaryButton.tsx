import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { fontFamilies } from '../constants/theme';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'solid' | 'ghost';
  style?: StyleProp<ViewStyle>;
};

export const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  variant = 'solid',
  style,
}: PrimaryButtonProps) => {
  const theme = useAppTheme();
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isGhost ? 'transparent' : theme.colors.primary,
          borderColor: isGhost ? theme.colors.border : theme.colors.primary,
          opacity: pressed ? 0.88 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? theme.colors.primary : '#FFFFFF'} />
      ) : (
        <Text
          style={[
            styles.label,
            {
              color: isGhost ? theme.colors.primary : '#FFFFFF',
            },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 20,
  },
  label: {
    fontFamily: fontFamilies.bold,
    fontSize: 16,
  },
});

