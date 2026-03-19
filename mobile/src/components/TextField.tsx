import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { fontFamilies } from '../constants/theme';
import { useAppTheme } from '../hooks/useAppTheme';

type TextFieldProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export const TextField = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  autoCapitalize = 'sentences',
}: TextFieldProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text> : null}
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.card,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            color: theme.colors.text,
            minHeight: multiline ? 112 : 58,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
        value={value}
      />
      {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  error: {
    fontFamily: fontFamilies.medium,
    fontSize: 12,
  },
});
