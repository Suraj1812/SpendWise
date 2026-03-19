import DateTimePicker from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import { expenseApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { categories, categoryKeys } from '../../constants/categories';
import { paymentMethodKeys, paymentMethods } from '../../constants/paymentMethods';
import { fontFamilies } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { RootStackParamList } from '../../navigation/types';
import { triggerHaptic } from '../../utils/haptics';
import { formatInputDate, getTodayDate } from '../../utils/format';

const expenseSchema = z.object({
  amount: z
    .string()
    .min(1, 'Enter an amount.')
    .refine((value) => Number(value) > 0, 'Amount must be greater than zero.'),
  category: z.enum(categoryKeys),
  paymentMethod: z.enum(paymentMethodKeys),
  isRecurring: z.boolean(),
  note: z.string().max(80, 'Keep the note under 80 characters.'),
  date: z.string().min(1, 'Please choose a date.'),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export const AddExpenseScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddExpense'>>();
  const theme = useAppTheme();
  const queryClient = useQueryClient();
  const expense = route.params?.expense;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { control, handleSubmit, watch, setValue, formState } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: expense ? String(expense.amount) : '',
      category: expense?.category ?? 'food',
      paymentMethod: expense?.paymentMethod ?? 'upi',
      isRecurring: expense?.isRecurring ?? false,
      note: expense?.note ?? '',
      date: expense?.date ?? getTodayDate(),
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ExpenseFormValues) => {
      const payload = {
        amount: Number(values.amount),
        category: values.category,
        paymentMethod: values.paymentMethod,
        isRecurring: values.isRecurring,
        note: values.note.trim(),
        date: values.date,
      };

      if (expense) {
        return expenseApi.update(expense.id, payload);
      }

      return expenseApi.create(payload);
    },
    onSuccess: async () => {
      await triggerHaptic('success');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['expenses'] }),
        queryClient.invalidateQueries({ queryKey: ['insights'] }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
      ]);
      navigation.goBack();
    },
    onError: async (error) => {
      await triggerHaptic('error');
      Alert.alert('Could not save expense', getErrorMessage(error));
    },
  });

  const selectedCategory = watch('category');
  const selectedPaymentMethod = watch('paymentMethod');
  const selectedDate = watch('date');
  const isRecurring = watch('isRecurring');

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[
              styles.backButton,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons color={theme.colors.text} name="arrow-back-outline" size={20} />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {expense ? 'Edit expense' : 'Add expense'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Capture amount, category, payment method, and recurring behavior in one pass.
            </Text>
          </View>
        </View>

        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, value } }) => (
            <View style={styles.amountWrap}>
              <Text style={[styles.amountLabel, { color: theme.colors.textMuted }]}>Amount</Text>
              <View
                style={[
                  styles.amountCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: formState.errors.amount ? theme.colors.danger : theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.currencyMark, { color: theme.colors.primary }]}>₹</Text>
                <TextInput
                  keyboardType="numeric"
                  onChangeText={onChange}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textMuted}
                  style={[styles.amountInput, { color: theme.colors.text }]}
                  value={value}
                />
              </View>
              {formState.errors.amount?.message ? (
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                  {formState.errors.amount.message}
                </Text>
              ) : null}
            </View>
          )}
        />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((category) => {
              const isSelected = selectedCategory === category.key;

              return (
                <Pressable
                  key={category.key}
                  onPress={() => setValue('category', category.key, { shouldValidate: true })}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: isSelected ? `${category.color}22` : theme.colors.card,
                      borderColor: isSelected ? category.color : theme.colors.border,
                    },
                  ]}
                >
                  <Ionicons color={category.color} name={category.icon} size={22} />
                  <Text style={[styles.categoryLabel, { color: theme.colors.text }]}>
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Payment method</Text>
          <View style={styles.categoryGrid}>
            {paymentMethods.map((method) => {
              const isSelected = selectedPaymentMethod === method.key;

              return (
                <Pressable
                  key={method.key}
                  onPress={() => setValue('paymentMethod', method.key, { shouldValidate: true })}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: isSelected ? `${method.color}22` : theme.colors.card,
                      borderColor: isSelected ? method.color : theme.colors.border,
                    },
                  ]}
                >
                  <Ionicons color={method.color} name={method.icon} size={22} />
                  <Text style={[styles.categoryLabel, { color: theme.colors.text }]}>
                    {method.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          style={[
            styles.recurringCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.recurringText}>
            <Text style={[styles.recurringTitle, { color: theme.colors.text }]}>Recurring payment</Text>
            <Text style={[styles.recurringSubtitle, { color: theme.colors.textMuted }]}>
              Mark rent, subscriptions, Wi-Fi, or repeat travel so insights can flag them separately.
            </Text>
          </View>
          <Switch
            onValueChange={(value) => {
              void triggerHaptic('selection');
              setValue('isRecurring', value, { shouldValidate: true });
            }}
            thumbColor="#FFFFFF"
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            value={isRecurring}
          />
        </View>

        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, value } }) => (
            <TextField
              error={formState.errors.note?.message}
              label="Note"
              multiline
              onChangeText={onChange}
              placeholder="What was this for?"
              value={value}
            />
          )}
        />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Date</Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.dateCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons color={theme.colors.primary} name="calendar-outline" size={20} />
            <Text style={[styles.dateLabel, { color: theme.colors.text }]}>
              {formatInputDate(selectedDate)}
            </Text>
          </Pressable>
          {formState.errors.date?.message ? (
            <Text style={[styles.errorText, { color: theme.colors.danger }]}>
              {formState.errors.date.message}
            </Text>
          ) : null}
        </View>

        {showDatePicker ? (
          <DateTimePicker
            display="default"
            mode="date"
            onChange={(_, value) => {
              setShowDatePicker(false);
              if (value) {
                setValue('date', format(value, 'yyyy-MM-dd'), { shouldValidate: true });
              }
            }}
            value={new Date(selectedDate)}
          />
        ) : null}

        <PrimaryButton
          loading={mutation.isPending}
          onPress={handleSubmit((values) => mutation.mutate(values))}
          style={styles.saveButton}
          title={expense ? 'Update Expense' : 'Save Expense'}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 80,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 24,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  headerText: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontFamily: fontFamilies.extraBold,
    fontSize: 28,
  },
  subtitle: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
  },
  amountWrap: {
    marginBottom: 20,
  },
  amountLabel: {
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
    marginBottom: 8,
  },
  amountCard: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 98,
    paddingHorizontal: 20,
  },
  currencyMark: {
    fontFamily: fontFamilies.extraBold,
    fontSize: 34,
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    fontFamily: fontFamilies.extraBold,
    fontSize: 34,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 16,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    minWidth: '47%',
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  categoryLabel: {
    fontFamily: fontFamilies.semibold,
    fontSize: 14,
    marginTop: 10,
  },
  recurringCard: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    padding: 18,
  },
  recurringText: {
    flex: 1,
    marginRight: 18,
  },
  recurringTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 16,
  },
  recurringSubtitle: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  dateCard: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 18,
  },
  dateLabel: {
    fontFamily: fontFamilies.semibold,
    fontSize: 15,
  },
  errorText: {
    fontFamily: fontFamilies.medium,
    fontSize: 12,
    marginTop: 8,
  },
  saveButton: {
    marginTop: 10,
  },
});
