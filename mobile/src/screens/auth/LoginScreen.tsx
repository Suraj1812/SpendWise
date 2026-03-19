import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MotiText, MotiView } from 'moti';
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

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password should be at least 6 characters.'),
});

type LoginValues = z.infer<typeof loginSchema>;

export const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const theme = useAppTheme();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();
  const { control, handleSubmit, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'demo@spendwise.app',
      password: 'demo123',
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (payload) => {
      queryClient.clear();
      setAuth(payload);
    },
    onError: (error) => {
      Alert.alert('Login failed', getErrorMessage(error));
    },
  });

  const guestMutation = useMutation({
    mutationFn: authApi.guest,
    onSuccess: (payload) => {
      queryClient.clear();
      setAuth(payload);
    },
    onError: (error) => {
      Alert.alert('Guest login failed', getErrorMessage(error));
    },
  });

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <MotiView
        animate={{ opacity: 1, translateY: 0 }}
        from={{ opacity: 0, translateY: 20 }}
        transition={{ duration: 700 }}
      >
        <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>SpendWise</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Track smart. Spend wiser.</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Log in fast, add expenses in seconds, and get clean monthly insights without the clutter.
        </Text>
      </MotiView>

      <MotiView
        animate={{ opacity: 1, translateY: 0 }}
        from={{ opacity: 0, translateY: 24 }}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
        transition={{ delay: 120, duration: 700 }}
      >
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
              placeholder="Enter your password"
              secureTextEntry
              value={value}
            />
          )}
        />

        <PrimaryButton
          loading={loginMutation.isPending}
          onPress={handleSubmit((values) => loginMutation.mutate(values))}
          title="Log In"
        />

        <PrimaryButton
          loading={guestMutation.isPending}
          onPress={() => guestMutation.mutate()}
          title="Continue as Guest"
          variant="ghost"
        />
      </MotiView>

      <View style={styles.footer}>
        <MotiText
          animate={{ opacity: 1 }}
          from={{ opacity: 0 }}
          style={[styles.demoText, { color: theme.colors.textMuted }]}
          transition={{ delay: 220, duration: 700 }}
        >
          Demo account: demo@spendwise.app / demo123
        </MotiText>

        <Pressable onPress={() => navigation.navigate('Signup')}>
          <Text style={[styles.switchText, { color: theme.colors.textMuted }]}>
            New here? <Text style={{ color: theme.colors.primary }}>Create an account</Text>
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 24,
  },
  eyebrow: {
    fontFamily: fontFamilies.bold,
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fontFamilies.extraBold,
    fontSize: 34,
    lineHeight: 40,
    marginTop: 16,
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
    marginTop: 32,
    padding: 22,
  },
  footer: {
    gap: 16,
    marginTop: 26,
  },
  demoText: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    lineHeight: 20,
  },
  switchText: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    textAlign: 'center',
  },
});
