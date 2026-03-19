import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { z } from 'zod';
import { authApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { fontFamilies } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/auth-store';
import type { AuthStackParamList } from '../../navigation/types';

const signupSchema = z.object({
  name: z.string().min(2, 'Name should be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password should be at least 6 characters.'),
});

type SignupValues = z.infer<typeof signupSchema>;

export const SignupScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const theme = useAppTheme();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();
  const { control, handleSubmit, formState } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (payload) => {
      queryClient.clear();
      setAuth(payload);
    },
    onError: (error) => {
      Alert.alert('Signup failed', getErrorMessage(error));
    },
  });

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Create your SpendWise account</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Start tracking daily expenses, understand your spending habits, and stay ahead of your budget.
        </Text>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextField
              error={formState.errors.name?.message}
              label="Full name"
              onChangeText={onChange}
              placeholder="Suraj Singh"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextField
              autoCapitalize="none"
              error={formState.errors.email?.message}
              keyboardType="email-address"
              label="Email"
              onChangeText={onChange}
              placeholder="you@example.com"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextField
              autoCapitalize="none"
              error={formState.errors.password?.message}
              label="Password"
              onChangeText={onChange}
              placeholder="Create a password"
              secureTextEntry
              value={value}
            />
          )}
        />

        <PrimaryButton
          loading={signupMutation.isPending}
          onPress={handleSubmit((values) => signupMutation.mutate(values))}
          title="Create Account"
        />
      </View>

      <Pressable onPress={() => navigation.navigate('Login')} style={styles.footer}>
        <Text style={[styles.switchText, { color: theme.colors.textMuted }]}>
          Already have an account? <Text style={{ color: theme.colors.primary }}>Log in</Text>
        </Text>
      </Pressable>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
  title: {
    fontFamily: fontFamilies.extraBold,
    fontSize: 30,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 14,
  },
  card: {
    borderRadius: 30,
    borderWidth: 1,
    gap: 16,
    marginTop: 28,
    padding: 22,
  },
  footer: {
    marginTop: 22,
  },
  switchText: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    textAlign: 'center',
  },
});

