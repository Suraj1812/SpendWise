export const paymentMethodKeys = ['upi', 'card', 'cash', 'bank'] as const;

export type PaymentMethodKey = (typeof paymentMethodKeys)[number];

export const paymentMethods = [
  { key: 'upi', label: 'UPI', icon: 'phone-portrait-outline', color: '#0EA5E9' },
  { key: 'card', label: 'Card', icon: 'card-outline', color: '#8B5CF6' },
  { key: 'cash', label: 'Cash', icon: 'cash-outline', color: '#F59E0B' },
  { key: 'bank', label: 'Bank', icon: 'business-outline', color: '#10B981' },
] as const satisfies ReadonlyArray<{
  key: PaymentMethodKey;
  label: string;
  icon: string;
  color: string;
}>;

export const paymentMethodMap = paymentMethods.reduce<
  Record<PaymentMethodKey, (typeof paymentMethods)[number]>
>((accumulator, method) => {
  accumulator[method.key] = method;
  return accumulator;
}, {} as Record<PaymentMethodKey, (typeof paymentMethods)[number]>);
