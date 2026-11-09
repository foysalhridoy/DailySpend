import Dexie, { type EntityTable } from 'dexie';
import {
  Wallet,
  Transaction,
  TrackingPeriod,
  Category,
  Budget,
  Receipt,
  DailyClosing,
  UserProfile,
} from '@/types';
import {
  DEFAULT_WALLETS,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '@/utils/constants';

export interface SyncQueueItem {
  id?: number;
  entity: 'transaction' | 'wallet' | 'tracking_period' | 'budget' | 'category' | 'daily_closing';
  action: 'create' | 'update' | 'delete';
  recordId: string;
  payload: Record<string, unknown>;
  timestamp: number;
  retries: number;
  error?: string;
}

class DailySpendDatabase extends Dexie {
  wallets!: EntityTable<Wallet, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;
  tracking_periods!: EntityTable<TrackingPeriod, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  budgets!: EntityTable<Budget, 'id'>;
  receipts!: EntityTable<Receipt, 'id'>;
  daily_closings!: EntityTable<DailyClosing, 'id'>;
  user_profiles!: EntityTable<UserProfile, 'id'>;
  sync_queue!: EntityTable<SyncQueueItem, 'id'>;

  constructor() {
    super('DailySpendDB');
    this.version(1).stores({
      wallets: 'id, user_id, name, type, is_default, is_archived',
      transactions: 'id, user_id, type, date, wallet_id, category_id, tracking_period_id, sync_status',
      tracking_periods: 'id, user_id, is_active, status, start_date, end_date',
      categories: 'id, user_id, name, type, parent_category',
      budgets: 'id, user_id, period_type, category_id, tracking_period_id',
      receipts: 'id, user_id, receipt_number, type, format, created_at',
      daily_closings: 'id, user_id, date, is_reviewed',
      user_profiles: 'id, email',
      sync_queue: '++id, entity, action, recordId, timestamp',
    });
  }

  /**
   * Seeds default database records for a new user if local tables are empty
   */
  async seedInitialData(userId: string): Promise<void> {
    const existingWallets = await this.wallets.where('user_id').equals(userId).count();
    if (existingWallets > 0) return;

    // 1. Seed Wallets
    const initialWallets: Wallet[] = DEFAULT_WALLETS.map((w, index) => ({
      id: `wallet-${userId}-${index + 1}`,
      user_id: userId,
      name: w.name,
      type: w.type,
      opening_balance: w.opening_balance,
      current_balance: w.opening_balance,
      color: w.color,
      icon: w.icon,
      is_default: w.is_default,
      created_at: new Date().toISOString(),
    }));
    await this.wallets.bulkAdd(initialWallets);

    // 2. Seed Categories
    const categories: Category[] = [
      ...DEFAULT_EXPENSE_CATEGORIES.map((c, index) => ({
        id: `cat-exp-${userId}-${index + 1}`,
        user_id: userId,
        name: c.name,
        type: 'expense' as const,
        parent_category: c.parent,
        icon: c.icon,
        color: c.color,
        is_default: true,
      })),
      ...DEFAULT_INCOME_CATEGORIES.map((c, index) => ({
        id: `cat-inc-${userId}-${index + 1}`,
        user_id: userId,
        name: c.name,
        type: 'income' as const,
        parent_category: c.parent,
        icon: c.icon,
        color: c.color,
        is_default: true,
      })),
    ];
    await this.categories.bulkAdd(categories);

    // 3. Seed an initial flexible Tracking Period (e.g. current week)
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay() + 1); // Monday
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Sunday

    const periodId = `period-${userId}-1`;
    const defaultPeriod: TrackingPeriod = {
      id: periodId,
      user_id: userId,
      name: 'Current Week',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      spending_target: 15000,
      is_active: true,
      status: 'active',
      notes: 'Initial flexible weekly tracking period',
      created_at: new Date().toISOString(),
    };
    await this.tracking_periods.add(defaultPeriod);

    // 4. Seed sample transactions so user immediately experiences the dashboard, timeline & charts
    const cashWallet = initialWallets.find(w => w.type === 'cash') || initialWallets[0];
    const bkashWallet = initialWallets.find(w => w.type === 'bkash') || initialWallets[1];

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const sampleTransactions: Transaction[] = [
      {
        id: `tx-${userId}-1`,
        user_id: userId,
        type: 'income',
        amount: 25000,
        category_name: 'Freelancing',
        category_icon: 'Laptop',
        wallet_id: bkashWallet.id,
        wallet_name: bkashWallet.name,
        tracking_period_id: periodId,
        date: yesterdayStr,
        time: '10:00',
        description: 'Client Website Milestone',
        notes: 'Payment received via bKash',
        payment_method: 'bKash',
        is_reviewed: true,
        created_at: new Date().toISOString(),
        sync_status: 'synced',
      },
      {
        id: `tx-${userId}-2`,
        user_id: userId,
        type: 'expense',
        amount: 80,
        category_name: 'Breakfast',
        category_icon: 'Coffee',
        wallet_id: cashWallet.id,
        wallet_name: cashWallet.name,
        tracking_period_id: periodId,
        date: todayStr,
        time: '08:30',
        description: 'Paratha and Egg at local diner',
        payment_method: 'Cash',
        is_reviewed: false,
        created_at: new Date().toISOString(),
        sync_status: 'synced',
      },
      {
        id: `tx-${userId}-3`,
        user_id: userId,
        type: 'expense',
        amount: 50,
        category_name: 'Rickshaw',
        category_icon: 'Bike',
        wallet_id: cashWallet.id,
        wallet_name: cashWallet.name,
        tracking_period_id: periodId,
        date: todayStr,
        time: '09:15',
        description: 'Rickshaw ride to office',
        payment_method: 'Cash',
        is_reviewed: false,
        created_at: new Date().toISOString(),
        sync_status: 'synced',
      },
      {
        id: `tx-${userId}-4`,
        user_id: userId,
        type: 'expense',
        amount: 220,
        category_name: 'Lunch',
        category_icon: 'Utensils',
        wallet_id: bkashWallet.id,
        wallet_name: bkashWallet.name,
        tracking_period_id: periodId,
        date: todayStr,
        time: '13:30',
        description: 'Rice, Chicken and Salad set lunch',
        payment_method: 'bKash',
        is_reviewed: false,
        created_at: new Date().toISOString(),
        sync_status: 'synced',
      },
      {
        id: `tx-${userId}-5`,
        user_id: userId,
        type: 'expense',
        amount: 30,
        category_name: 'Tea/Coffee',
        category_icon: 'CupSoda',
        wallet_id: cashWallet.id,
        wallet_name: cashWallet.name,
        tracking_period_id: periodId,
        date: todayStr,
        time: '17:00',
        description: 'Evening Milk Tea & Biscuits',
        payment_method: 'Cash',
        is_reviewed: false,
        created_at: new Date().toISOString(),
        sync_status: 'synced',
      },
    ];

    await this.transactions.bulkAdd(sampleTransactions);
  }
}

export const localDb = new DailySpendDatabase();

