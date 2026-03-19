import { useQuery } from '@tanstack/react-query';
import { RefreshControl, useWindowDimensions, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { insightsApi } from '../../api/endpoints';
import { ErrorState } from '../../components/ErrorState';
import { LoadingView } from '../../components/LoadingView';
import { Screen } from '../../components/Screen';
import { SectionCard } from '../../components/SectionCard';
import { fontFamilies } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/auth-store';
import { formatCurrency } from '../../utils/format';

export const InsightsScreen = () => {
  const { width } = useWindowDimensions();
  const theme = useAppTheme();
  const token = useAuthStore((state) => state.token);
  const insightsQuery = useQuery({
    queryKey: ['insights'],
    queryFn: insightsApi.getOverview,
    enabled: Boolean(token),
  });

  if (insightsQuery.isPending) {
    return (
      <Screen>
        <LoadingView label="Calculating your insights..." />
      </Screen>
    );
  }

  if (insightsQuery.error) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <ErrorState
          message="SpendWise couldn't build the latest insight models. Retry to refresh charts and smart text."
          onRetry={() => insightsQuery.refetch()}
        />
      </Screen>
    );
  }

  const overview = insightsQuery.data;
  const chartWidth = Math.max(width - 88, 260);
  const total = overview?.categoryBreakdown.reduce((sum, item) => sum + item.total, 0) ?? 0;
  const circumference = 2 * Math.PI * 74;
  let cumulativeLength = 0;
  const maxTrend = Math.max(...(overview?.monthlyTrend.map((item) => item.total) ?? [0]), 1);

  return (
    <Screen
      refreshControl={
        <RefreshControl
          onRefresh={() => insightsQuery.refetch()}
          refreshing={insightsQuery.isRefetching}
          tintColor={theme.colors.primary}
        />
      }
      scroll
      contentContainerStyle={styles.content}
    >
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Insights</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          SpendWise turns your transactions into simple, interview-ready story points.
        </Text>
      </View>

      <SectionCard title="This month in one glance" subtitle="Fast numbers for demos and decisions">
        <View style={styles.summaryRow}>
          <View>
            <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>Budget used</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {overview?.summary.spentPercentOfBudget ?? 0}%
            </Text>
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>Daily avg</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {formatCurrency(overview?.summary.averageDailySpend ?? 0)}
            </Text>
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>Count</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {overview?.summary.transactionCount ?? 0}
            </Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Category spending" subtitle="Your monthly pie chart">
        {overview?.categoryBreakdown.length ? (
          <>
            <View style={styles.donutWrap}>
              <Svg height={240} viewBox="0 0 220 220" width={chartWidth}>
                <Circle
                  cx="110"
                  cy="110"
                  fill="transparent"
                  r="74"
                  stroke={theme.colors.border}
                  strokeWidth="30"
                />
                {overview.categoryBreakdown.map((item) => {
                  const length = total === 0 ? 0 : (item.total / total) * circumference;
                  const circle = (
                    <Circle
                      key={item.category}
                      cx="110"
                      cy="110"
                      fill="transparent"
                      origin="110, 110"
                      r="74"
                      rotation="-90"
                      stroke={item.color}
                      strokeDasharray={`${length} ${circumference - length}`}
                      strokeDashoffset={-cumulativeLength}
                      strokeLinecap="round"
                      strokeWidth="30"
                    />
                  );

                  cumulativeLength += length;
                  return circle;
                })}
              </Svg>

              <View style={styles.donutCenter}>
                <Text style={[styles.donutAmount, { color: theme.colors.text }]}>
                  {formatCurrency(total)}
                </Text>
                <Text style={[styles.donutCaption, { color: theme.colors.textMuted }]}>
                  spent this month
                </Text>
              </View>
            </View>

            <View style={styles.legend}>
              {overview.categoryBreakdown.map((item) => (
                <View key={item.category} style={styles.legendRow}>
                  <View style={styles.legendLeft}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.legendLabel, { color: theme.colors.text }]}>{item.label}</Text>
                  </View>
                  <Text style={[styles.legendValue, { color: theme.colors.textMuted }]}>
                    {formatCurrency(item.total)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            Add a few expenses to see category percentages and your top spending area.
          </Text>
        )}
      </SectionCard>

      <SectionCard title="Monthly trend" subtitle="Spending movement over the last 6 months">
        <View style={styles.trendWrap}>
          {(overview?.monthlyTrend ?? []).map((item, index) => {
            const height = `${Math.max((item.total / maxTrend) * 100, item.total > 0 ? 16 : 4)}%` as const;

            return (
              <View key={item.month} style={styles.barSlot}>
                <Animated.View
                  entering={FadeInDown.delay(index * 70).duration(500)}
                  style={[
                    styles.bar,
                    {
                      backgroundColor: index === (overview?.monthlyTrend.length ?? 0) - 1
                        ? theme.colors.primary
                        : theme.colors.primarySoft,
                      height,
                    },
                  ]}
                />
                <Text style={[styles.barValue, { color: theme.colors.textMuted }]}>
                  ₹{Math.round(item.total / 1000)}k
                </Text>
                <Text style={[styles.barLabel, { color: theme.colors.text }]}>{item.month}</Text>
              </View>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard title="Smart text" subtitle="The story you can say in demos or interviews">
        <View
          style={[
            styles.textCard,
            {
              backgroundColor: theme.colors.cardAlt,
            },
          ]}
        >
          <Text style={[styles.smartText, { color: theme.colors.text }]}>
            {overview?.highlightText.category}
          </Text>
        </View>
        <View
          style={[
            styles.textCard,
            {
              backgroundColor: theme.colors.cardAlt,
            },
          ]}
        >
          <Text style={[styles.smartText, { color: theme.colors.text }]}>
            {overview?.highlightText.trend}
          </Text>
        </View>
      </SectionCard>
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
  },
  summaryValue: {
    fontFamily: fontFamilies.extraBold,
    fontSize: 18,
    marginTop: 8,
  },
  donutWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    alignItems: 'center',
    position: 'absolute',
  },
  donutAmount: {
    fontFamily: fontFamilies.extraBold,
    fontSize: 22,
  },
  donutCaption: {
    fontFamily: fontFamilies.medium,
    fontSize: 12,
    marginTop: 6,
  },
  legend: {
    gap: 12,
  },
  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  legendDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  legendLabel: {
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
  },
  legendValue: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
  },
  trendWrap: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
    height: 220,
    justifyContent: 'space-between',
  },
  barSlot: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 999,
    minHeight: 10,
    width: '100%',
  },
  barValue: {
    fontFamily: fontFamilies.medium,
    fontSize: 11,
    marginTop: 10,
  },
  barLabel: {
    fontFamily: fontFamilies.semibold,
    fontSize: 12,
    marginTop: 4,
  },
  textCard: {
    borderRadius: 20,
    padding: 16,
  },
  smartText: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    lineHeight: 22,
  },
  emptyText: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    lineHeight: 22,
  },
});
