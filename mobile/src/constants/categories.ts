export const categoryKeys = [
  'food',
  'travel',
  'shopping',
  'bills',
  'health',
  'entertainment',
  'groceries',
  'utilities',
] as const;

export type CategoryKey = (typeof categoryKeys)[number];

export const categories = [
  { key: 'food', label: 'Food', icon: 'fast-food-outline', color: '#F59E0B' },
  { key: 'travel', label: 'Travel', icon: 'car-sport-outline', color: '#3B82F6' },
  { key: 'shopping', label: 'Shopping', icon: 'bag-handle-outline', color: '#8B5CF6' },
  { key: 'bills', label: 'Bills', icon: 'receipt-outline', color: '#EF4444' },
  { key: 'health', label: 'Health', icon: 'medkit-outline', color: '#10B981' },
  {
    key: 'entertainment',
    label: 'Fun',
    icon: 'game-controller-outline',
    color: '#EC4899',
  },
  { key: 'groceries', label: 'Groceries', icon: 'basket-outline', color: '#14B8A6' },
  { key: 'utilities', label: 'Utilities', icon: 'flash-outline', color: '#64748B' },
] as const satisfies ReadonlyArray<{
  key: CategoryKey;
  label: string;
  icon: string;
  color: string;
}>;

export const categoryMap = categories.reduce<
  Record<CategoryKey, (typeof categories)[number]>
>((accumulator, category) => {
  accumulator[category.key] = category;
  return accumulator;
}, {} as Record<CategoryKey, (typeof categories)[number]>);

