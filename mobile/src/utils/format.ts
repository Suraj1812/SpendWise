import { format, parseISO } from 'date-fns';

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const formatInputDate = (value: string) => format(parseISO(value), 'dd MMM yyyy');

export const formatTransactionDate = (value: string) => format(parseISO(value), 'dd MMM');

export const getTodayDate = () => format(new Date(), 'yyyy-MM-dd');

