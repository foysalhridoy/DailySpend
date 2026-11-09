import { WalletType } from '@/types';

export const DEFAULT_CURRENCY = '৳';
export const DEFAULT_CURRENCY_CODE = 'BDT';
export const DEFAULT_TIMEZONE = 'Asia/Dhaka';

export const DEFAULT_WALLETS: Array<{
  name: string;
  type: WalletType;
  color: string;
  icon: string;
  opening_balance: number;
  is_default: boolean;
}> = [
  { name: 'Cash', type: 'cash', color: '#10b981', icon: 'Banknote', opening_balance: 0, is_default: true },
  { name: 'bKash', type: 'bkash', color: '#e2136e', icon: 'Smartphone', opening_balance: 0, is_default: false },
  { name: 'Nagad', type: 'nagad', color: '#f37021', icon: 'Flame', opening_balance: 0, is_default: false },
  { name: 'Rocket', type: 'rocket', color: '#8c3494', icon: 'Rocket', opening_balance: 0, is_default: false },
  { name: 'Bank Account', type: 'bank', color: '#2563eb', icon: 'Building2', opening_balance: 0, is_default: false },
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  // Food
  { name: 'Breakfast', parent: 'Food', icon: 'Coffee', color: '#f59e0b' },
  { name: 'Lunch', parent: 'Food', icon: 'Utensils', color: '#f97316' },
  { name: 'Dinner', parent: 'Food', icon: 'UtensilsCrossed', color: '#ef4444' },
  { name: 'Snacks', parent: 'Food', icon: 'Cookie', color: '#eab308' },
  { name: 'Tea/Coffee', parent: 'Food', icon: 'CupSoda', color: '#b45309' },
  { name: 'Restaurant', parent: 'Food', icon: 'Wine', color: '#f43f5e' },
  { name: 'Groceries', parent: 'Food', icon: 'ShoppingBag', color: '#10b981' },

  // Transport
  { name: 'Bus', parent: 'Transport', icon: 'Bus', color: '#3b82f6' },
  { name: 'Rickshaw', parent: 'Transport', icon: 'Bike', color: '#06b6d4' },
  { name: 'CNG', parent: 'Transport', icon: 'Car', color: '#14b8a6' },
  { name: 'Ride Sharing', parent: 'Transport', icon: 'Navigation', color: '#6366f1' },
  { name: 'Other Transport', parent: 'Transport', icon: 'Compass', color: '#8b5cf6' },

  // Personal
  { name: 'Shopping', parent: 'Personal', icon: 'ShoppingCart', color: '#ec4899' },
  { name: 'Clothing', parent: 'Personal', icon: 'Shirt', color: '#d946ef' },
  { name: 'Entertainment', parent: 'Personal', icon: 'Film', color: '#a855f7' },
  { name: 'Mobile Recharge', parent: 'Personal', icon: 'PhoneCall', color: '#10b981' },
  { name: 'Internet', parent: 'Personal', icon: 'Wifi', color: '#0ea5e9' },
  { name: 'Health', parent: 'Personal', icon: 'HeartPulse', color: '#f43f5e' },
  { name: 'Education', parent: 'Personal', icon: 'GraduationCap', color: '#4f46e5' },
  { name: 'Personal Care', parent: 'Personal', icon: 'Sparkles', color: '#ec4899' },

  // Other
  { name: 'Bills', parent: 'Other', icon: 'Receipt', color: '#64748b' },
  { name: 'Gifts', parent: 'Other', icon: 'Gift', color: '#f43f5e' },
  { name: 'Donations', parent: 'Other', icon: 'Heart', color: '#10b981' },
  { name: 'Miscellaneous', parent: 'Other', icon: 'Layers', color: '#71717a' },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Family Allowance', parent: 'Income', icon: 'Home', color: '#10b981' },
  { name: 'Freelancing', parent: 'Income', icon: 'Laptop', color: '#3b82f6' },
  { name: 'Tuition', parent: 'Income', icon: 'BookOpen', color: '#8b5cf6' },
  { name: 'Scholarship', parent: 'Income', icon: 'Award', color: '#f59e0b' },
  { name: 'Gifts', parent: 'Income', icon: 'Gift', color: '#ec4899' },
  { name: 'Other Income', parent: 'Income', icon: 'Coins', color: '#06b6d4' },
];

