export type WalletType = 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank' | 'other';

export type TransactionType = 'expense' | 'income' | 'transfer';

export type BudgetPeriodType = 'daily' | 'weekly' | 'monthly' | 'period' | 'category';

export type ReceiptType = 'individual' | 'daily' | 'period' | 'summary';

export type ReceiptFormat = '58mm' | '80mm' | 'a4';

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'failed' | 'offline';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  currency_symbol: string; // Default: '৳'
  currency_code: string;   // Default: 'BDT'
  date_format: string;     // Default: 'yyyy-MM-dd'
  time_format: '12h' | '24h';
  theme: 'light' | 'dark' | 'system';
  is_onboarded: boolean;
  created_at: string;
}

export interface UserSettings {
  id?: string;
  user_id: string;
  preferences: Record<string, unknown>;
  notifications_enabled: boolean;
  default_wallet_id?: string;
  low_balance_threshold: number;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  type: WalletType;
  opening_balance: number;
  current_balance: number;
  color: string;
  icon: string;
  is_default: boolean;
  is_archived?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'expense' | 'income';
  parent_category?: string;
  icon: string;
  color: string;
  is_default?: boolean;
}

export interface TrackingPeriod {
  id: string;
  user_id: string;
  name: string;
  start_date: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  spending_target?: number;
  is_active: boolean;
  status: 'active' | 'closed';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  period_type: BudgetPeriodType;
  category_id?: string;
  category_name?: string;
  tracking_period_id?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category_id?: string;
  category_name?: string;
  category_icon?: string;
  wallet_id: string;
  wallet_name?: string;
  to_wallet_id?: string;
  to_wallet_name?: string;
  tracking_period_id?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description: string;
  notes?: string;
  payment_method?: string;
  is_reviewed?: boolean;
  receipt_url?: string;
  created_at: string;
  updated_at?: string;
  sync_status?: SyncStatus;
}

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  time: string;
  title: string;
  userName: string;
  currency: string;
  items: Array<{
    description: string;
    category?: string;
    amount: number;
    wallet?: string;
    time?: string;
  }>;
  totalIncome: number;
  totalExpense: number;
  openingBalance?: number;
  closingBalance?: number;
  paymentMethod?: string;
  trackingPeriodName?: string;
  notes?: string;
}

export interface Receipt {
  id: string;
  user_id: string;
  receipt_number: string;
  type: ReceiptType;
  transaction_id?: string;
  format: ReceiptFormat;
  data: ReceiptData;
  created_at: string;
}

export interface DailyClosing {
  id: string;
  user_id: string;
  date: string;
  total_income: number;
  total_expense: number;
  closing_balance: number;
  is_reviewed: boolean;
  notes?: string;
  created_at: string;
}

export interface FinancialStats {
  availableBalance: number;
  totalOpeningBalance: number;
  periodIncome: number;
  periodExpense: number;
  todayExpense: number;
  todayIncome: number;
  remainingBudget: number | null;
  averageDailyExpense: number;
  netCashFlow: number;
  highestSpendingDay?: { date: string; amount: number };
  lowestSpendingDay?: { date: string; amount: number };
  topCategory?: { name: string; amount: number; percentage: number };
}

export interface TransactionFilter {
  search?: string;
  type?: TransactionType | 'all';
  walletId?: string | 'all';
  categoryId?: string | 'all';
  periodId?: string | 'all';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

