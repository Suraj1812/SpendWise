import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { categoryMap } from '../constants/categories';
import { fontFamilies } from '../constants/theme';
import { paymentMethodMap } from '../constants/paymentMethods';
import { useAppTheme } from '../hooks/useAppTheme';
import type { Expense } from '../types/api';
import { formatCurrency, formatTransactionDate } from '../utils/format';

type ExpenseRowProps = {
  expense: Expense;
  onPress: () => void;
  onDelete: () => void;
};

export const ExpenseRow = ({ expense, onPress, onDelete }: ExpenseRowProps) => {
  const theme = useAppTheme();
  const category = categoryMap[expense.category];
  const paymentMethod = paymentMethodMap[expense.paymentMethod];

  return (
    <Swipeable
      overshootRight={false}
      renderRightActions={() => (
        <Pressable
          onPress={onDelete}
          style={[
            styles.deleteAction,
            {
              backgroundColor: theme.colors.danger,
            },
          ]}
        >
          <Ionicons color="#FFFFFF" name="trash-outline" size={22} />
        </Pressable>
      )}
    >
      <Pressable
        onPress={onPress}
        style={[
          styles.row,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: `${category.color}22`,
            },
          ]}
        >
          <Ionicons color={category.color} name={category.icon} size={22} />
        </View>

        <View style={styles.info}>
          <Text style={[styles.category, { color: theme.colors.text }]}>{category.label}</Text>
          <View style={styles.metaLine}>
            <Text style={[styles.note, { color: theme.colors.textMuted }]}>
              {expense.note || 'No note added'}
            </Text>
          </View>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: theme.colors.cardAlt,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: theme.colors.textMuted }]}>
                {paymentMethod.label}
              </Text>
            </View>
            {expense.isRecurring ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: theme.colors.primarySoft,
                  },
                ]}
              >
                <Text style={[styles.badgeText, { color: theme.colors.primary }]}>Recurring</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.meta}>
          <Text style={[styles.amount, { color: theme.colors.text }]}>
            {formatCurrency(expense.amount)}
          </Text>
          <Text style={[styles.date, { color: theme.colors.textMuted }]}>
            {formatTransactionDate(expense.date)}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 92,
    paddingHorizontal: 16,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 18,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  category: {
    fontFamily: fontFamilies.bold,
    fontSize: 16,
  },
  note: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    marginTop: 6,
  },
  metaLine: {
    flexDirection: 'row',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fontFamilies.semibold,
    fontSize: 11,
  },
  meta: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  amount: {
    fontFamily: fontFamilies.bold,
    fontSize: 16,
  },
  date: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    marginTop: 6,
  },
  deleteAction: {
    alignItems: 'center',
    borderRadius: 24,
    justifyContent: 'center',
    marginLeft: 12,
    minWidth: 84,
  },
});
