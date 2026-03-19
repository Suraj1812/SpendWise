import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Switch, Text, View } from 'react-native';
import { expenseApi, profileApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/ErrorState';
import { LoadingView } from '../../components/LoadingView';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { TextField } from '../../components/TextField';
import { fontFamilies } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/auth-store';
import { triggerHaptic } from '../../utils/haptics';
import { formatCurrency } from '../../utils/format';

export const ProfileScreen = () => {
  const theme = useAppTheme();
  const token = useAuthStore((state) => state.token);
  const themeMode = useAuthStore((state) => state.themeMode);
  const setThemeMode = useAuthStore((state) => state.setThemeMode);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();
  const [budgetInput, setBudgetInput] = useState('');
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
    enabled: Boolean(token),
  });

  useEffect(() => {
    if (profileQuery.data) {
      setUser(profileQuery.data);
      setBudgetInput(String(profileQuery.data.monthlyBudget));
    }
  }, [profileQuery.data, setUser]);

  const budgetMutation = useMutation({
    mutationFn: profileApi.updateBudget,
    onSuccess: async (user) => {
      await triggerHaptic('success');
      setUser(user);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['insights'] }),
      ]);
    },
    onError: async (error) => {
      await triggerHaptic('error');
      Alert.alert('Could not update budget', getErrorMessage(error));
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const csv = await expenseApi.exportCsv();
      const targetDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

      if (!targetDirectory) {
        throw new Error('No writable directory is available for export on this device.');
      }

      const fileUri = `${targetDirectory}spendwise-expenses-export.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          dialogTitle: 'Export SpendWise expenses',
          mimeType: 'text/csv',
          UTI: 'public.comma-separated-values-text',
        });
      }

      return { fileUri, canShare };
    },
    onSuccess: async ({ canShare, fileUri }) => {
      await triggerHaptic('success');
      Alert.alert(
        'Export ready',
        canShare
          ? 'Your CSV export has been prepared and opened in the share sheet.'
          : `CSV saved to: ${fileUri}`,
      );
    },
    onError: async (error) => {
      await triggerHaptic('error');
      Alert.alert('Export failed', getErrorMessage(error));
    },
  });

  if (profileQuery.isPending) {
    return (
      <Screen>
        <LoadingView label="Loading your profile..." />
      </Screen>
    );
  }

  if (profileQuery.error) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <ErrorState
          message="SpendWise couldn't load your profile, settings, and budget controls. Retry to continue."
          onRetry={() => profileQuery.refetch()}
        />
      </Screen>
    );
  }

  const user = profileQuery.data;
  const refreshControl = (
    <RefreshControl
      onRefresh={() => profileQuery.refetch()}
      refreshing={profileQuery.isRefetching}
      tintColor={theme.colors.primary}
    />
  );

  return (
    <Screen refreshControl={refreshControl} scroll contentContainerStyle={styles.content}>
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Profile</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Budget settings, theme controls, export tools, and your account details.
        </Text>
      </View>

      <SectionCard title="Account" subtitle="The person behind the spending plan">
        <View style={styles.accountRow}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primarySoft }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {user?.name?.slice(0, 1).toUpperCase() ?? 'S'}
            </Text>
          </View>
          <View style={styles.accountText}>
            <Text style={[styles.accountName, { color: theme.colors.text }]}>{user?.name}</Text>
            <Text style={[styles.accountEmail, { color: theme.colors.textMuted }]}>
              {user?.email}
            </Text>
            {user?.isGuest ? (
              <Text style={[styles.guestLabel, { color: theme.colors.warning }]}>Guest session</Text>
            ) : null}
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Monthly budget" subtitle="Keep your limit visible and practical">
        <TextField
          keyboardType="numeric"
          label="Budget amount"
          onChangeText={setBudgetInput}
          placeholder="25000"
          value={budgetInput}
        />
        <Text style={[styles.helperText, { color: theme.colors.textMuted }]}>
          Current target: {formatCurrency(user?.monthlyBudget ?? 0)}
        </Text>
        <PrimaryButton
          loading={budgetMutation.isPending}
          onPress={() => {
            const budget = Number(budgetInput);
            if (!Number.isFinite(budget) || budget <= 0) {
              Alert.alert('Invalid budget', 'Please enter a budget amount greater than zero.');
              return;
            }

            budgetMutation.mutate(budget);
          }}
          title="Save Budget"
        />
      </SectionCard>

      <SectionCard title="Data tools" subtitle="Move your data out whenever you need it">
        <Text style={[styles.toolText, { color: theme.colors.textMuted }]}>
          Export your full transaction history as CSV for interviews, reports, backups, or spreadsheet analysis.
        </Text>
        <PrimaryButton
          loading={exportMutation.isPending}
          onPress={() => exportMutation.mutate()}
          title="Export CSV"
        />
      </SectionCard>

      <SectionCard title="Appearance" subtitle="Switch between clean light and dark modes">
        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={[styles.toggleTitle, { color: theme.colors.text }]}>Dark mode</Text>
            <Text style={[styles.toggleSubtitle, { color: theme.colors.textMuted }]}>
              Great for late-night tracking and battery-friendly viewing.
            </Text>
          </View>
          <Switch
            onValueChange={(value) => {
              void triggerHaptic('selection');
              setThemeMode(value ? 'dark' : 'light');
            }}
            thumbColor="#FFFFFF"
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            value={themeMode === 'dark'}
          />
        </View>
      </SectionCard>

      <SectionCard title="Readiness" subtitle="What this build now covers end to end">
        <Text style={[styles.futureItem, { color: theme.colors.text }]}>Budget alerts and insights</Text>
        <Text style={[styles.futureItem, { color: theme.colors.text }]}>Filtered transaction history</Text>
        <Text style={[styles.futureItem, { color: theme.colors.text }]}>Recurring and payment metadata</Text>
        <Text style={[styles.futureItem, { color: theme.colors.text }]}>CSV export and share flow</Text>
        <Text style={[styles.futureItem, { color: theme.colors.text }]}>Safer runtime error fallback</Text>
      </SectionCard>

      <PrimaryButton
        onPress={() => {
          queryClient.clear();
          logout();
        }}
        title="Logout"
        variant="ghost"
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    gap: 18,
    paddingBottom: 120,
    paddingTop: 16,
  },
  title: {
    fontFamily: fontFamilies.extraBold,
    fontSize: 28,
  },
  subtitle: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  accountRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 24,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  avatarText: {
    fontFamily: fontFamilies.extraBold,
    fontSize: 24,
  },
  accountText: {
    marginLeft: 14,
  },
  accountName: {
    fontFamily: fontFamilies.bold,
    fontSize: 17,
  },
  accountEmail: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    marginTop: 4,
  },
  guestLabel: {
    fontFamily: fontFamilies.semibold,
    fontSize: 12,
    marginTop: 6,
  },
  helperText: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
  },
  toolText: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    lineHeight: 20,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleText: {
    flex: 1,
    marginRight: 18,
  },
  toggleTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 16,
  },
  toggleSubtitle: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  futureItem: {
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
  },
});
