import type { Expense } from '../types/api';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  AddExpense: { expense?: Expense } | undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type TabParamList = {
  Home: undefined;
  Expenses: undefined;
  Insights: undefined;
  Profile: undefined;
};

