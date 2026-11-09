import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { localDb } from '@/db/dexie';
import { syncService } from '@/db/syncService';
import { supabase, isSupabaseConfigured } from '@/db/supabase';
import {
  Wallet,
  Transaction,
  TrackingPeriod,
  Category,
  Budget,
  DailyClosing,
  SyncStatus,
  FinancialStats,
} from '@/types';
import {
  calculateWalletBalance,
  calculateFinancialStats,
  roundCurrency,
} from '@/utils/calculations';

interface FinanceContextType {
  wallets: Wallet[];
  transactions: Transaction[];
  trackingPeriods: TrackingPeriod[];
  activePeriod: TrackingPeriod | null;
  categories: Category[];
  budgets: Budget[];
  dailyClosings: DailyClosing[];
  stats: FinancialStats;
  syncStatus: SyncStatus;
  loading: boolean;

  // Transaction Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Wallet Actions
  addWallet: (wallet: Omit<Wallet, 'id' | 'user_id' | 'current_balance' | 'created_at'>) => Promise<Wallet>;
  updateWallet: (id: string, updates: Partial<Wallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  transferBetweenWallets: (sourceWalletId: string, destWalletId: string, amount: number, notes?: string) => Promise<void>;

  // Tracking Period Actions
  addTrackingPeriod: (period: Omit<TrackingPeriod, 'id' | 'user_id' | 'created_at'>) => Promise<TrackingPeriod>;
  updateTrackingPeriod: (id: string, updates: Partial<TrackingPeriod>) => Promise<void>;
  setActivePeriod: (periodId: string) => Promise<void>;
  closeTrackingPeriod: (id: string) => Promise<void>;
  reopenTrackingPeriod: (id: string) => Promise<void>;

  // Budget Actions
  addBudget: (budget: Omit<Budget, 'id' | 'user_id' | 'created_at'>) => Promise<Budget>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Category Actions
  addCategory: (category: Omit<Category, 'id' | 'user_id'>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;

  // Daily Closing
  saveDailyClosing: (closing: Omit<DailyClosing, 'id' | 'user_id' | 'created_at'>) => Promise<DailyClosing>;
  isDayClosed: (dateStr: string) => boolean;

  // Refresh & Backup
  refreshData: () => Promise<void>;
  exportBackupJSON: () => Promise<string>;
  restoreBackupJSON: (jsonData: string) => Promise<boolean>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trackingPeriods, setTrackingPeriods] = useState<TrackingPeriod[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dailyClosings, setDailyClosings] = useState<DailyClosing[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [loading, setLoading] = useState<boolean>(true);

  // Sync listener
  useEffect(() => {
    const unsubscribe = syncService.subscribeStatus((status) => {
      setSyncStatus(status);
    });
    return () => unsubscribe();
  }, []);

  // Fetch local and cloud data
  const refreshData = useCallback(async () => {
    if (!user) {
      setWallets([]);
      setTransactions([]);
      setTrackingPeriods([]);
      setCategories([]);
      setBudgets([]);
      setDailyClosings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load from local IndexedDB first for instant rendering
      const [localW, localT, localP, localC, localB, localD] = await Promise.all([
        localDb.wallets.where('user_id').equals(user.id).toArray(),
        localDb.transactions.where('user_id').equals(user.id).reverse().sortBy('date'),
        localDb.tracking_periods.where('user_id').equals(user.id).toArray(),
        localDb.categories.where('user_id').equals(user.id).toArray(),
        localDb.budgets.where('user_id').equals(user.id).toArray(),
        localDb.daily_closings.where('user_id').equals(user.id).toArray(),
      ]);

      // Calculate reconciled current balances for each wallet
      const reconciledWallets = localW.map(w => ({
        ...w,
        current_balance: calculateWalletBalance(w, localT),
      }));

      setWallets(reconciledWallets);
      setTransactions(localT);
      setTrackingPeriods(localP);
      setCategories(localC);
      setBudgets(localB);
      setDailyClosings(localD);

      // If Supabase is connected and online, fetch remote updates in the background
      const client = supabase;
      if (isSupabaseConfigured && client && navigator.onLine) {
        syncService.processQueue().then(async () => {
          try {
            const [remW, remT, remP, remC, remB, remD] = await Promise.all([
              client.from('wallets').select('*').eq('user_id', user.id),
              client.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
              client.from('tracking_periods').select('*').eq('user_id', user.id),
              client.from('categories').select('*').eq('user_id', user.id),
              client.from('budgets').select('*').eq('user_id', user.id),
              client.from('daily_closings').select('*').eq('user_id', user.id),
            ]);

            if (remW.data && remW.data.length > 0) {
              await localDb.wallets.bulkPut(remW.data);
            }
            if (remT.data && remT.data.length > 0) {
              await localDb.transactions.bulkPut(remT.data);
            }
            if (remP.data && remP.data.length > 0) {
              await localDb.tracking_periods.bulkPut(remP.data);
            }
            if (remC.data && remC.data.length > 0) {
              await localDb.categories.bulkPut(remC.data);
            }
            if (remB.data && remB.data.length > 0) {
              await localDb.budgets.bulkPut(remB.data);
            }
            if (remD.data && remD.data.length > 0) {
              await localDb.daily_closings.bulkPut(remD.data);
            }
          } catch (cloudErr) {
            console.warn('Could not pull remote changes:', cloudErr);
          }
        });
      }
    } catch (err) {
      console.error('Error refreshing finance data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Determine active tracking period
  const activePeriod = useMemo(() => {
    const active = trackingPeriods.find(p => p.is_active && p.status === 'active');
    return active || trackingPeriods[0] || null;
  }, [trackingPeriods]);

  // Compute calculated financial stats
  const stats = useMemo(() => {
    return calculateFinancialStats(wallets, transactions, activePeriod, budgets[0] || null);
  }, [wallets, transactions, activePeriod, budgets]);

  // Add Transaction
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> => {
    if (!user) throw new Error('User not authenticated');

    const id = `tx-${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newTx: Transaction = {
      ...txData,
      id,
      user_id: user.id,
      created_at: new Date().toISOString(),
      sync_status: 'pending',
    };

    // Save to local IndexedDB
    await localDb.transactions.add(newTx);

    // Update state immediately
    const updatedTransactions = [newTx, ...transactions];
    setTransactions(updatedTransactions);

    // Reconcile wallet balances
    setWallets(prevWallets =>
      prevWallets.map(w => ({
        ...w,
        current_balance: calculateWalletBalance(w, updatedTransactions),
      }))
    );

    // Queue for sync
    await syncService.queueChange('transaction', 'create', id, newTx as unknown as Record<string, unknown>);

    return newTx;
  };

  // Update Transaction
  const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<void> => {
    if (!user) return;
    const existing = transactions.find(t => t.id === id);
    if (!existing) return;

    const updatedTx: Transaction = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await localDb.transactions.put(updatedTx);

    const updatedList = transactions.map(t => (t.id === id ? updatedTx : t));
    setTransactions(updatedList);

    setWallets(prevWallets =>
      prevWallets.map(w => ({
        ...w,
        current_balance: calculateWalletBalance(w, updatedList),
      }))
    );

    await syncService.queueChange('transaction', 'update', id, updatedTx as unknown as Record<string, unknown>);
  };

  // Delete Transaction
  const deleteTransaction = async (id: string): Promise<void> => {
    if (!user) return;
    await localDb.transactions.delete(id);

    const filtered = transactions.filter(t => t.id !== id);
    setTransactions(filtered);

    setWallets(prevWallets =>
      prevWallets.map(w => ({
        ...w,
        current_balance: calculateWalletBalance(w, filtered),
      }))
    );

    await syncService.queueChange('transaction', 'delete', id, {});
  };

  // Add Wallet
  const addWallet = async (walletData: Omit<Wallet, 'id' | 'user_id' | 'current_balance' | 'created_at'>): Promise<Wallet> => {
    if (!user) throw new Error('User not authenticated');
    const id = `wallet-${user.id}-${Date.now()}`;
    const newWallet: Wallet = {
      ...walletData,
      id,
      user_id: user.id,
      current_balance: Number(walletData.opening_balance) || 0,
      created_at: new Date().toISOString(),
    };

    await localDb.wallets.add(newWallet);
    setWallets(prev => [...prev, newWallet]);

    await syncService.queueChange('wallet', 'create', id, newWallet as unknown as Record<string, unknown>);
    return newWallet;
  };

  // Update Wallet
  const updateWallet = async (id: string, updates: Partial<Wallet>): Promise<void> => {
    if (!user) return;
    const existing = wallets.find(w => w.id === id);
    if (!existing) return;

    const updated: Wallet = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await localDb.wallets.put(updated);
    setWallets(prev => prev.map(w => (w.id === id ? updated : w)));

    await syncService.queueChange('wallet', 'update', id, updated as unknown as Record<string, unknown>);
  };

  // Delete Wallet
  const deleteWallet = async (id: string): Promise<void> => {
    if (!user) return;
    await localDb.wallets.delete(id);
    setWallets(prev => prev.filter(w => w.id !== id));
    await syncService.queueChange('wallet', 'delete', id, {});
  };

  // Transfer Between Wallets
  const transferBetweenWallets = async (
    sourceWalletId: string,
    destWalletId: string,
    amount: number,
    notes?: string
  ): Promise<void> => {
    if (!user) return;
    const src = wallets.find(w => w.id === sourceWalletId);
    const dst = wallets.find(w => w.id === destWalletId);
    if (!src || !dst) throw new Error('Invalid wallets selected');

    const desc = `Transfer from ${src.name} to ${dst.name}`;
    await addTransaction({
      type: 'transfer',
      amount: roundCurrency(amount),
      wallet_id: sourceWalletId,
      wallet_name: src.name,
      to_wallet_id: destWalletId,
      to_wallet_name: dst.name,
      tracking_period_id: activePeriod?.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().substring(0, 5),
      description: desc,
      notes: notes || desc,
      payment_method: 'Transfer',
      is_reviewed: true,
    });
  };

  // Tracking Periods
  const addTrackingPeriod = async (
    periodData: Omit<TrackingPeriod, 'id' | 'user_id' | 'created_at'>
  ): Promise<TrackingPeriod> => {
    if (!user) throw new Error('User not authenticated');
    const id = `period-${user.id}-${Date.now()}`;
    const newPeriod: TrackingPeriod = {
      ...periodData,
      id,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    if (newPeriod.is_active) {
      // Deactivate other active periods
      await Promise.all(
        trackingPeriods.map(async p => {
          if (p.is_active) {
            await localDb.tracking_periods.update(p.id, { is_active: false });
          }
        })
      );
    }

    await localDb.tracking_periods.add(newPeriod);
    setTrackingPeriods(prev => [newPeriod, ...prev.map(p => newPeriod.is_active ? { ...p, is_active: false } : p)]);

    await syncService.queueChange('tracking_period', 'create', id, newPeriod as unknown as Record<string, unknown>);
    return newPeriod;
  };

  const updateTrackingPeriod = async (id: string, updates: Partial<TrackingPeriod>): Promise<void> => {
    if (!user) return;
    const existing = trackingPeriods.find(p => p.id === id);
    if (!existing) return;

    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    await localDb.tracking_periods.put(updated);
    setTrackingPeriods(prev => prev.map(p => (p.id === id ? updated : p)));
    await syncService.queueChange('tracking_period', 'update', id, updated as unknown as Record<string, unknown>);
  };

  const setActivePeriod = async (periodId: string): Promise<void> => {
    if (!user) return;
    for (const p of trackingPeriods) {
      const active = p.id === periodId;
      await localDb.tracking_periods.update(p.id, { is_active: active });
    }
    setTrackingPeriods(prev => prev.map(p => ({ ...p, is_active: p.id === periodId })));
  };

  const closeTrackingPeriod = async (id: string): Promise<void> => {
    await updateTrackingPeriod(id, { status: 'closed', is_active: false });
  };

  const reopenTrackingPeriod = async (id: string): Promise<void> => {
    await updateTrackingPeriod(id, { status: 'active', is_active: true });
  };

  // Budgets
  const addBudget = async (budgetData: Omit<Budget, 'id' | 'user_id' | 'created_at'>): Promise<Budget> => {
    if (!user) throw new Error('User not authenticated');
    const id = `budget-${user.id}-${Date.now()}`;
    const newBudget: Budget = {
      ...budgetData,
      id,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    await localDb.budgets.add(newBudget);
    setBudgets(prev => [...prev, newBudget]);
    await syncService.queueChange('budget', 'create', id, newBudget as unknown as Record<string, unknown>);
    return newBudget;
  };

  const updateBudget = async (id: string, updates: Partial<Budget>): Promise<void> => {
    if (!user) return;
    const existing = budgets.find(b => b.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    await localDb.budgets.put(updated);
    setBudgets(prev => prev.map(b => (b.id === id ? updated : b)));
    await syncService.queueChange('budget', 'update', id, updated as unknown as Record<string, unknown>);
  };

  const deleteBudget = async (id: string): Promise<void> => {
    if (!user) return;
    await localDb.budgets.delete(id);
    setBudgets(prev => prev.filter(b => b.id !== id));
    await syncService.queueChange('budget', 'delete', id, {});
  };

  // Categories
  const addCategory = async (categoryData: Omit<Category, 'id' | 'user_id'>): Promise<Category> => {
    if (!user) throw new Error('User not authenticated');
    const id = `cat-${user.id}-${Date.now()}`;
    const newCat: Category = {
      ...categoryData,
      id,
      user_id: user.id,
    };
    await localDb.categories.add(newCat);
    setCategories(prev => [...prev, newCat]);
    await syncService.queueChange('category', 'create', id, newCat as unknown as Record<string, unknown>);
    return newCat;
  };

  const deleteCategory = async (id: string): Promise<void> => {
    if (!user) return;
    await localDb.categories.delete(id);
    setCategories(prev => prev.filter(c => c.id !== id));
    await syncService.queueChange('category', 'delete', id, {});
  };

  // Daily Closing
  const saveDailyClosing = async (
    closingData: Omit<DailyClosing, 'id' | 'user_id' | 'created_at'>
  ): Promise<DailyClosing> => {
    if (!user) throw new Error('User not authenticated');
    const id = `closing-${user.id}-${closingData.date}`;
    const newClosing: DailyClosing = {
      ...closingData,
      id,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    await localDb.daily_closings.put(newClosing);
    setDailyClosings(prev => {
      const idx = prev.findIndex(d => d.date === closingData.date);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newClosing;
        return copy;
      }
      return [...prev, newClosing];
    });

    await syncService.queueChange('daily_closing', 'create', id, newClosing as unknown as Record<string, unknown>);
    return newClosing;
  };

  const isDayClosed = (dateStr: string): boolean => {
    return dailyClosings.some(d => d.date === dateStr && d.is_reviewed);
  };

  // Export JSON Backup
  const exportBackupJSON = async (): Promise<string> => {
    if (!user) return '';
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user,
      wallets,
      transactions,
      trackingPeriods,
      categories,
      budgets,
      dailyClosings,
    };
    return JSON.stringify(data, null, 2);
  };

  // Restore JSON Backup
  const restoreBackupJSON = async (jsonData: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.wallets || !parsed.transactions) {
        throw new Error('Invalid backup file format');
      }

      await localDb.wallets.clear();
      await localDb.transactions.clear();
      await localDb.tracking_periods.clear();
      await localDb.categories.clear();
      await localDb.budgets.clear();
      await localDb.daily_closings.clear();

      await localDb.wallets.bulkAdd(parsed.wallets);
      await localDb.transactions.bulkAdd(parsed.transactions);
      if (parsed.trackingPeriods) await localDb.tracking_periods.bulkAdd(parsed.trackingPeriods);
      if (parsed.categories) await localDb.categories.bulkAdd(parsed.categories);
      if (parsed.budgets) await localDb.budgets.bulkAdd(parsed.budgets);
      if (parsed.dailyClosings) await localDb.daily_closings.bulkAdd(parsed.dailyClosings);

      await refreshData();
      return true;
    } catch (err) {
      console.error('Failed to restore backup:', err);
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        wallets,
        transactions,
        trackingPeriods,
        activePeriod,
        categories,
        budgets,
        dailyClosings,
        stats,
        syncStatus,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addWallet,
        updateWallet,
        deleteWallet,
        transferBetweenWallets,
        addTrackingPeriod,
        updateTrackingPeriod,
        setActivePeriod,
        closeTrackingPeriod,
        reopenTrackingPeriod,
        addBudget,
        updateBudget,
        deleteBudget,
        addCategory,
        deleteCategory,
        saveDailyClosing,
        isDayClosed,
        refreshData,
        exportBackupJSON,
        restoreBackupJSON,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
