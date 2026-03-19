import type { CategoryKey } from '../constants/categories';
import type { PaymentMethodKey } from '../constants/paymentMethods';
import { api } from './client';
import type { AuthResponse, Expense, InsightOverview, User } from '../types/api';

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type ExpensePayload = {
  amount: number;
  category: CategoryKey;
  paymentMethod: PaymentMethodKey;
  isRecurring: boolean;
  note: string;
  date: string;
};

export type ExpenseFilters = {
  search?: string;
  category?: CategoryKey | 'all';
  paymentMethod?: PaymentMethodKey | 'all';
  month?: string;
  sort?: 'latest' | 'oldest' | 'highest' | 'lowest';
};

export const authApi = {
  login: async (payload: LoginPayload) => {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },
  signup: async (payload: SignupPayload) => {
    const response = await api.post<AuthResponse>('/auth/signup', payload);
    return response.data;
  },
  guest: async () => {
    const response = await api.post<AuthResponse>('/auth/guest');
    return response.data;
  },
};

export const expenseApi = {
  list: async (filters: ExpenseFilters = {}) => {
    const response = await api.get<{ expenses: Expense[] }>('/expenses', {
      params: filters,
    });
    return response.data.expenses;
  },
  create: async (payload: ExpensePayload) => {
    const response = await api.post<{ expense: Expense }>('/expenses', payload);
    return response.data.expense;
  },
  update: async (expenseId: string, payload: ExpensePayload) => {
    const response = await api.put<{ expense: Expense }>(`/expenses/${expenseId}`, payload);
    return response.data.expense;
  },
  remove: async (expenseId: string) => {
    await api.delete(`/expenses/${expenseId}`);
  },
  exportCsv: async (filters: ExpenseFilters = {}) => {
    const response = await api.get('/expenses/export', {
      params: filters,
      responseType: 'text',
      transformResponse: [(value) => value],
    });
    return response.data as string;
  },
};

export const profileApi = {
  get: async () => {
    const response = await api.get<{ user: User }>('/profile');
    return response.data.user;
  },
  updateBudget: async (monthlyBudget: number) => {
    const response = await api.put<{ user: User }>('/profile/budget', { monthlyBudget });
    return response.data.user;
  },
};

export const insightsApi = {
  getOverview: async () => {
    const response = await api.get<{ overview: InsightOverview }>('/insights/overview');
    return response.data.overview;
  },
};
