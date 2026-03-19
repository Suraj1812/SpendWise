import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';
import { fontFamilies } from '../constants/theme';
import { useAppTheme } from '../hooks/useAppTheme';

type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export const SearchField = ({
  value,
  onChangeText,
  placeholder = 'Search expenses',
}: SearchFieldProps) => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Ionicons color={theme.colors.textMuted} name="search-outline" size={18} />
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, { color: theme.colors.text }]}
        value={value}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    paddingVertical: 12,
  },
});

