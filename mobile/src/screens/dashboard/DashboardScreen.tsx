import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useEffect } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { insightsApi, profileApi } from '../../api/endpoints';
import { ErrorState } from '../../components/ErrorState';
import { FloatingAddButton } from '../../components/FloatingAddButton';
import { LoadingView } from '../../components/LoadingView';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { categoryMap } from '../../constants/categories';
import { fontFamilies } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/auth-store';
import type { Expense } from '../../types/api';
import { formatCurrency, formatTransactionDate } from '../../utils/format';

export const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const token = useAuthStore((state) => state.token);
  const storedUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
    enabled: Boolean(token),
  });
  const insightsQuery = useQuery({
    queryKey: ['insights'],
    queryFn: insightsApi.getOverview,
    enabled: Boolean(token),
  });

  useEffect(() => {
    if (profileQuery.data) {
      setUser(profileQuery.data);
    }
  }, [profileQuery.data, setUser]);

  if (profileQuery.isPending || insightsQuery.isPending) {
    return (
      <Screen>
        <LoadingView label="Building your dashboard..." />
      </Screen>
    );
  }

  if (profileQuery.error || insightsQuery.error) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <ErrorState
          message="SpendWise couldn't load the latest dashboard data. Retry to refresh your summary, alerts, and recent activity."
          onRetry={() => {
            profileQuery.refetch();
            insightsQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  const user = profileQuery.data ?? storedUser;
  const overview = insightsQuery.data;
  const breakdown = overview?.categoryBreakdown.slice(0, 3) ?? [];
  const refreshControl = (
    <RefreshControl
      onRefresh={() => {
        profileQuery.refetch();
        insightsQuery.refetch();
      }}
      refreshing={profileQuery.isRefetching || insightsQuery.isRefetching}
      tintColor={theme.colors.primary}
    />
  );

  return (
    <View style={styles.root}>
      <Screen refreshControl={refreshControl} scroll contentContainerStyle={styles.content}>
        <MotiView animate={{ opacity: 1, translateY: 0 }} from={{ opacity: 0, translateY: 18 }}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            Hi {user?.name ?? 'there'} 👋
          </Text>
          <Text style={[styles.caption, { color: theme.colors.textMuted }]}>
            Your money story this month, simplified and ready to act on.
          </Text>
        </MotiView>

        <LinearGradient
          colors={['#39B267', '#2E9F5A', '#1F7B42']}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryLabel}>This month</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(overview?.summary.totalSpent ?? 0)}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    overview?.summary.budgetStatus === 'over'
                      ? 'rgba(255,255,255,0.18)'
                      : 'rgba(255,255,255,0.14)',
                },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {overview?.summary.budgetStatus === 'over'
                  ? 'Over budget'
                  : overview?.summary.budgetStatus === 'warning'
                    ? 'Watch budget'
                    : 'On track'}
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(overview?.summary.spentPercentOfBudget ?? 0, 100)}%`,
                },
              ]}
            />
          </View>

          <View style={styles.summaryMetrics}>
            <View style={styles.metricBlock}>
              <Text style={styles.metricLabel}>Budget</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(overview?.summary.budget ?? 0)}
              </Text>
            </View>

            <View style={styles.metricBlock}>
              <Text style={styles.metricLabel}>Remaining</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(overview?.summary.remaining ?? 0)}
              </Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View>
              <Text style={styles.statLabel}>Daily avg</Text>
              <Text style={styles.statValue}>
                {formatCurrency(overview?.summary.averageDailySpend ?? 0)}
              </Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Transactions</Text>
              <Text style={styles.statValue}>{overview?.summary.transactionCount ?? 0}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Used</Text>
              <Text style={styles.statValue}>{overview?.summary.spentPercentOfBudget ?? 0}%</Text>
            </View>
          </View>
        </LinearGradient>

        <SectionCard title="Budget alerts" subtitle="Signals that matter before the month gets away">
          {(overview?.alerts ?? []).map((alert) => (
            <View
              key={alert.id}
              style={[
                styles.alertCard,
                {
                  backgroundColor:
                    alert.level === 'over'
                      ? 'rgba(239, 68, 68, 0.12)'
                      : alert.level === 'warning'
                        ? 'rgba(245, 158, 11, 0.14)'
                        : theme.colors.cardAlt,
                },
              ]}
            >
              <Ionicons
                color={
                  alert.level === 'over'
                    ? theme.colors.danger
                    : alert.level === 'warning'
                      ? theme.colors.warning
                      : theme.colors.primary
                }
                name={
                  alert.level === 'over'
                    ? 'alert-circle-outline'
                    : alert.level === 'warning'
                      ? 'warning-outline'
                      : 'sparkles-outline'
                }
                size={20}
              />
              <View style={styles.alertTextWrap}>
                <Text style={[styles.alertTitle, { color: theme.colors.text }]}>{alert.title}</Text>
                <Text style={[styles.alertMessage, { color: theme.colors.textMuted }]}>
                  {alert.message}
                </Text>
              </View>
            </View>
          ))}
        </SectionCard>

        <SectionCard title="Category breakdown" subtitle="Where your money went most often">
          {breakdown.length ? (
            breakdown.map((item) => {
              const category = categoryMap[item.category];

              return (
                <View key={item.category} style={styles.breakdownRow}>
                  <View style={styles.breakdownLeft}>
                    <View
                      style={[
                        styles.breakdownIcon,
                        {
                          backgroundColor: `${category.color}22`,
                        },
                      ]}
                    >
                      <Ionicons color={category.color} name={category.icon} size={18} />
                    </View>
                    <View>
                      <Text style={[styles.breakdownTitle, { color: theme.colors.text }]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.breakdownMeta, { color: theme.colors.textMuted }]}>
                        {item.percent}% of your month
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.breakdownAmount, { color: theme.colors.text }]}>
                    {formatCurrency(item.total)}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              Add your first expense to see the split across food, travel, shopping, and more.
            </Text>
          )}
        </SectionCard>

        <SectionCard title="Recent activity" subtitle="Your latest tracked expenses">
          {overview?.recentExpenses.length ? (
            overview.recentExpenses.map((expense) => (
              <RecentExpenseRow
                expense={expense}
                key={expense.id}
                onPress={() => navigation.navigate('AddExpense', { expense })}
              />
            ))
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              Track a couple of transactions and your recent activity feed will appear here.
            </Text>
          )}
        </SectionCard>

        <SectionCard title="Smart insights" subtitle="Simple signals from this month">
          <View
            style={[
              styles.highlightCard,
              {
                backgroundColor: theme.colors.cardAlt,
              },
            ]}
          >
            <Ionicons color={theme.colors.primary} name="sparkles-outline" size={20} />
            <Text style={[styles.highlightText, { color: theme.colors.text }]}>
              {overview?.highlightText.category ?? 'Track a few expenses to unlock your first insight.'}
            </Text>
          </View>

          <View
            style={[
              styles.highlightCard,
              {
                backgroundColor: theme.colors.cardAlt,
              },
            ]}
          >
            <Ionicons color={theme.colors.warning} name="trending-up-outline" size={20} />
            <Text style={[styles.highlightText, { color: theme.colors.text }]}>
              {overview?.highlightText.trend ??
                'Once you have two months of spending, SpendWise will compare the trend for you.'}
            </Text>
          </View>
        </SectionCard>

        <SectionCard title="Quick move" subtitle="Capture a spend before you forget it">
          <Pressable
            onPress={() => navigation.navigate('AddExpense')}
            style={[
              styles.quickAction,
              {
                backgroundColor: theme.colors.primarySoft,
              },
            ]}
          >
            <View style={styles.quickActionText}>
              <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>
                Add an expense
              </Text>
              <Text style={[styles.quickActionSubtitle, { color: theme.colors.textMuted }]}>
                Amount, category, payment method, recurring flag, note, and date in one clean flow.
              </Text>
            </View>
            <Ionicons color={theme.colors.primary} name="arrow-forward-outline" size={24} />
          </Pressable>
        </SectionCard>
      </Screen>

      <FloatingAddButton onPress={() => navigation.navigate('AddExpense')} />
    </View>
  );
};

const RecentExpenseRow = ({
  expense,
  onPress,
}: {
  expense: Expense;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  const category = categoryMap[expense.category];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.recentRow,
        {
          backgroundColor: theme.colors.cardAlt,
        },
      ]}
    >
      <View
        style={[
          styles.recentIcon,
          {
            backgroundColor: `${category.color}22`,
          },
        ]}
      >
        <Ionicons color={category.color} name={category.icon} size={18} />
      </View>
      <View style={styles.recentTextWrap}>
        <Text style={[styles.recentTitle, { color: theme.colors.text }]}>{category.label}</Text>
        <Text style={[styles.recentSubtitle, { color: theme.colors.textMuted }]}>
          {expense.note || 'No note'} • {formatTransactionDate(expense.date)}
        </Text>
      </View>
      <Text style={[styles.recentAmount, { color: theme.colors.text }]}>
        {formatCurrency(expense.amount)}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    gap: 18,
    paddingBottom: 140,
    paddingTop: 16,
  },
  greeting: {
    fontFamily: fontFamilies.extraBold,
    fontSize: 30,
  },
  caption: {
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    marginTop: 8,
  },
  summaryCard: {
    borderRadius: 30,
    marginTop: 10,
    padding: 24,
  },
  summaryHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#D9FFE7',
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.extraBold,
    fontSize: 32,
    marginTop: 8,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.bold,
    fontSize: 12,
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    height: 10,
    marginTop: 22,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: '100%',
  },
  summaryMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 22,
  },
  metricBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    flex: 1,
    padding: 16,
  },
  metricLabel: {
    color: '#E7FFF0',
    fontFamily: fontFamilies.medium,
    fontSize: 13,
  },
  metricValue: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.bold,
    fontSize: 18,
    marginTop: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  statLabel: {
    color: '#D9FFE7',
    fontFamily: fontFamilies.medium,
    fontSize: 12,
  },
  statValue: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.bold,
    fontSize: 16,
    marginTop: 8,
  },
  alertCard: {
    borderRadius: 22,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  alertTextWrap: {
    flex: 1,
  },
  alertTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
  },
  alertMessage: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
  },
  breakdownRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  breakdownIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  breakdownTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
  },
  breakdownMeta: {
    fontFamily: fontFamilies.medium,
    fontSize: 12,
    marginTop: 4,
  },
  breakdownAmount: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
  },
  recentRow: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  recentIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  recentTextWrap: {
    flex: 1,
  },
  recentTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
  },
  recentSubtitle: {
    fontFamily: fontFamilies.medium,
    fontSize: 12,
    marginTop: 5,
  },
  recentAmount: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
  },
  highlightCard: {
    borderRadius: 20,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  highlightText: {
    flex: 1,
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    lineHeight: 22,
  },
  quickAction: {
    alignItems: 'center',
    borderRadius: 22,
    flexDirection: 'row',
    gap: 16,
    padding: 18,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 16,
  },
  quickActionSubtitle: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  emptyText: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    lineHeight: 22,
  },
});
