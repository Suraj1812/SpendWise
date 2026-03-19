import { useDeferredValue, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { expenseApi, type ExpenseFilters } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { ExpenseRow } from '../../components/ExpenseRow';
import { ErrorState } from '../../components/ErrorState';
import { FilterChip } from '../../components/FilterChip';
import { FloatingAddButton } from '../../components/FloatingAddButton';
import { LoadingView } from '../../components/LoadingView';
import { Screen } from '../../components/Screen';
import { SearchField } from '../../components/SearchField';
import { SectionCard } from '../../components/SectionCard';
import { categories } from '../../constants/categories';
import { paymentMethods } from '../../constants/paymentMethods';
import { fontFamilies } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/auth-store';
import type { Expense } from '../../types/api';
import { triggerHaptic } from '../../utils/haptics';
import { formatCurrency } from '../../utils/format';

const monthFilters = [
  { label: 'All time', value: undefined },
  { label: 'This month', value: new Date().toISOString().slice(0, 7) },
] as const;

const sortFilters = [
  { label: 'Latest', value: 'latest' },
  { label: 'Highest', value: 'highest' },
  { label: 'Lowest', value: 'lowest' },
] as const satisfies ReadonlyArray<{ label: string; value: NonNullable<ExpenseFilters['sort']> }>;

export const ExpenseListScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseFilters['category']>('all');
  const [selectedPayment, setSelectedPayment] = useState<ExpenseFilters['paymentMethod']>('all');
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(monthFilters[1].value);
  const [selectedSort, setSelectedSort] = useState<ExpenseFilters['sort']>('latest');
  const deferredSearch = useDeferredValue(search);
  const filters: ExpenseFilters = {
    search: deferredSearch || undefined,
    category: selectedCategory,
    paymentMethod: selectedPayment,
    month: selectedMonth,
    sort: selectedSort,
  };

  const expensesQuery = useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => expenseApi.list(filters),
    enabled: Boolean(token),
  });

  const deleteMutation = useMutation({
    mutationFn: expenseApi.remove,
    onSuccess: async () => {
      await triggerHaptic('success');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['expenses'] }),
        queryClient.invalidateQueries({ queryKey: ['insights'] }),
      ]);
    },
    onError: async (error) => {
      await triggerHaptic('error');
      Alert.alert('Delete failed', getErrorMessage(error));
    },
  });

  const totalFiltered = (expensesQuery.data ?? []).reduce((sum, expense) => sum + expense.amount, 0);

  const renderItem = ({ item }: { item: Expense }) => (
    <ExpenseRow
      expense={item}
      onDelete={() =>
        Alert.alert('Delete expense?', 'This action will remove the transaction permanently.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteMutation.mutate(item.id),
          },
        ])
      }
      onPress={() => navigation.navigate('AddExpense', { expense: item })}
    />
  );

  if (expensesQuery.isPending) {
    return (
      <Screen>
        <LoadingView label="Loading your expenses..." />
      </Screen>
    );
  }

  if (expensesQuery.error) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <ErrorState
          message="SpendWise couldn't load your transaction history. Retry to refresh your filters and expense list."
          onRetry={() => expensesQuery.refetch()}
        />
      </Screen>
    );
  }

  return (
    <View style={styles.root}>
      <Screen contentContainerStyle={styles.container}>
        <FlatList
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <SectionCard title="No expenses match these filters" subtitle="Try loosening the search or reset a few chips">
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                SpendWise is checking note text, category, payment method, month, and sorting for this view.
              </Text>
            </SectionCard>
          }
          ListHeaderComponent={
            <View style={styles.headerWrap}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>All transactions</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                  Search, filter, sort, swipe to delete, and tap any item to edit it.
                </Text>
              </View>

              <SectionCard title="Snapshot" subtitle="What this filtered view adds up to">
                <View style={styles.snapshotRow}>
                  <View>
                    <Text style={[styles.snapshotLabel, { color: theme.colors.textMuted }]}>Entries</Text>
                    <Text style={[styles.snapshotValue, { color: theme.colors.text }]}>
                      {expensesQuery.data?.length ?? 0}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.snapshotLabel, { color: theme.colors.textMuted }]}>Total</Text>
                    <Text style={[styles.snapshotValue, { color: theme.colors.text }]}>
                      {formatCurrency(totalFiltered)}
                    </Text>
                  </View>
                </View>
              </SectionCard>

              <SearchField onChangeText={setSearch} value={search} />

              <FilterSection label="Month">
                {monthFilters.map((item) => (
                  <FilterChip
                    active={selectedMonth === item.value}
                    key={item.label}
                    label={item.label}
                    onPress={() => {
                      void triggerHaptic('selection');
                      setSelectedMonth(item.value);
                    }}
                  />
                ))}
              </FilterSection>

              <FilterSection label="Category">
                <FilterChip
                  active={selectedCategory === 'all'}
                  label="All"
                  onPress={() => {
                    void triggerHaptic('selection');
                    setSelectedCategory('all');
                  }}
                />
                {categories.map((category) => (
                  <FilterChip
                    active={selectedCategory === category.key}
                    key={category.key}
                    label={category.label}
                    onPress={() => {
                      void triggerHaptic('selection');
                      setSelectedCategory(category.key);
                    }}
                  />
                ))}
              </FilterSection>

              <FilterSection label="Payment">
                <FilterChip
                  active={selectedPayment === 'all'}
                  label="All"
                  onPress={() => {
                    void triggerHaptic('selection');
                    setSelectedPayment('all');
                  }}
                />
                {paymentMethods.map((method) => (
                  <FilterChip
                    active={selectedPayment === method.key}
                    key={method.key}
                    label={method.label}
                    onPress={() => {
                      void triggerHaptic('selection');
                      setSelectedPayment(method.key);
                    }}
                  />
                ))}
              </FilterSection>

              <FilterSection label="Sort">
                {sortFilters.map((sort) => (
                  <FilterChip
                    active={selectedSort === sort.value}
                    key={sort.value}
                    label={sort.label}
                    onPress={() => {
                      void triggerHaptic('selection');
                      setSelectedSort(sort.value);
                    }}
                  />
                ))}
              </FilterSection>
            </View>
          }
          contentContainerStyle={styles.listContent}
          data={expensesQuery.data ?? []}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              onRefresh={() => expensesQuery.refetch()}
              refreshing={expensesQuery.isRefetching}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </Screen>

      <FloatingAddButton onPress={() => navigation.navigate('AddExpense')} />
    </View>
  );
};

const FilterSection = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.filterSection}>
      <Text style={[styles.filterLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>{children}</View>
      </ScrollView>
    </View>
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
  container: {
    paddingTop: 16,
  },
  listContent: {
    paddingBottom: 140,
  },
  headerWrap: {
    gap: 16,
    marginBottom: 18,
  },
  header: {
    marginBottom: 2,
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
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  snapshotLabel: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
  },
  snapshotValue: {
    fontFamily: fontFamilies.extraBold,
    fontSize: 22,
    marginTop: 8,
  },
  filterSection: {
    gap: 8,
  },
  filterLabel: {
    fontFamily: fontFamilies.semibold,
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 8,
  },
  separator: {
    height: 14,
  },
  emptyText: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    lineHeight: 22,
  },
});
