import { Wallet, Transaction, FinancialStats, TrackingPeriod, Budget } from '@/types';

/**
 * Rounds a number to 2 decimal places to avoid standard JS floating point inaccuracies
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Computes wallet balance:
 * Opening Wallet Balance + Income - Expenses + Transfers In - Transfers Out
 */
export function calculateWalletBalance(
  wallet: Wallet,
  transactions: Transaction[]
): number {
  let balance = Number(wallet.opening_balance) || 0;

  for (const t of transactions) {
    const amt = Number(t.amount) || 0;
    if (t.type === 'expense' && t.wallet_id === wallet.id) {
      balance -= amt;
    } else if (t.type === 'income' && t.wallet_id === wallet.id) {
      balance += amt;
    } else if (t.type === 'transfer') {
      if (t.wallet_id === wallet.id) {
        // Source wallet
        balance -= amt;
      }
      if (t.to_wallet_id === wallet.id) {
        // Destination wallet
        balance += amt;
      }
    }
  }

  return roundCurrency(balance);
}

/**
 * Calculates complete financial stats for the active tracking period or all time:
 * Available Balance = Sum of all Wallet Opening Balances + Total Income - Total Expenses
 * (Transfers internally net to 0)
 */
export function calculateFinancialStats(
  wallets: Wallet[],
  transactions: Transaction[],
  activePeriod?: TrackingPeriod | null,
  activeBudget?: Budget | null
): FinancialStats {
  const totalOpeningBalance = wallets.reduce((acc, w) => acc + (Number(w.opening_balance) || 0), 0);

  // Overall calculations across all transactions
  let totalIncome = 0;
  let totalExpense = 0;

  // Tracking period calculations
  let periodIncome = 0;
  let periodExpense = 0;

  // Today calculations (in local date YYYY-MM-DD)
  const todayStr = getTodayDateString();
  let todayExpense = 0;
  let todayIncome = 0;

  // Day breakdown map for highest/lowest day
  const dailyExpensesMap: Record<string, number> = {};
  const categoryExpensesMap: Record<string, { name: string; amount: number }> = {};

  for (const t of transactions) {
    const amt = Number(t.amount) || 0;

    if (t.type === 'income') {
      totalIncome += amt;
      if (!activePeriod || t.tracking_period_id === activePeriod.id || isDateInPeriod(t.date, activePeriod)) {
        periodIncome += amt;
      }
      if (t.date === todayStr) {
        todayIncome += amt;
      }
    } else if (t.type === 'expense') {
      totalExpense += amt;

      const isCurrentPeriod = !activePeriod || t.tracking_period_id === activePeriod.id || isDateInPeriod(t.date, activePeriod);
      if (isCurrentPeriod) {
        periodExpense += amt;

        // Group by day for period stats
        dailyExpensesMap[t.date] = (dailyExpensesMap[t.date] || 0) + amt;

        // Group by category
        const catName = t.category_name || 'Uncategorized';
        if (!categoryExpensesMap[catName]) {
          categoryExpensesMap[catName] = { name: catName, amount: 0 };
        }
        categoryExpensesMap[catName].amount += amt;
      }

      if (t.date === todayStr) {
        todayExpense += amt;
      }
    }
    // Transfers are excluded from total Income and total Expense
  }

  const availableBalance = roundCurrency(totalOpeningBalance + totalIncome - totalExpense);
  const netCashFlow = roundCurrency(periodIncome - periodExpense);

  // Average daily expense in period
  let daysInPeriod = 1;
  if (activePeriod && activePeriod.start_date) {
    const start = new Date(activePeriod.start_date);
    const end = activePeriod.end_date ? new Date(activePeriod.end_date) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    daysInPeriod = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  } else {
    const uniqueDays = Object.keys(dailyExpensesMap).length;
    daysInPeriod = Math.max(1, uniqueDays);
  }
  const averageDailyExpense = roundCurrency(periodExpense / daysInPeriod);

  // Highest and lowest spending days
  let highestSpendingDay: { date: string; amount: number } | undefined;
  let lowestSpendingDay: { date: string; amount: number } | undefined;

  const dayEntries = Object.entries(dailyExpensesMap);
  if (dayEntries.length > 0) {
    dayEntries.sort((a, b) => b[1] - a[1]);
    highestSpendingDay = { date: dayEntries[0][0], amount: roundCurrency(dayEntries[0][1]) };
    lowestSpendingDay = { date: dayEntries[dayEntries.length - 1][0], amount: roundCurrency(dayEntries[dayEntries.length - 1][1]) };
  }

  // Top category
  let topCategory: { name: string; amount: number; percentage: number } | undefined;
  const catEntries = Object.values(categoryExpensesMap).sort((a, b) => b.amount - a.amount);
  if (catEntries.length > 0 && periodExpense > 0) {
    const top = catEntries[0];
    topCategory = {
      name: top.name,
      amount: roundCurrency(top.amount),
      percentage: Math.round((top.amount / periodExpense) * 100),
    };
  }

  // Remaining budget
  let remainingBudget: number | null = null;
  if (activePeriod && activePeriod.spending_target) {
    remainingBudget = roundCurrency(activePeriod.spending_target - periodExpense);
  } else if (activeBudget) {
    remainingBudget = roundCurrency(activeBudget.amount - periodExpense);
  }

  return {
    availableBalance,
    totalOpeningBalance: roundCurrency(totalOpeningBalance),
    periodIncome: roundCurrency(periodIncome),
    periodExpense: roundCurrency(periodExpense),
    todayExpense: roundCurrency(todayExpense),
    todayIncome: roundCurrency(todayIncome),
    remainingBudget,
    averageDailyExpense,
    netCashFlow,
    highestSpendingDay,
    lowestSpendingDay,
    topCategory,
  };
}

/**
 * Checks if a date falls inside a tracking period's start and end dates
 */
export function isDateInPeriod(dateStr: string, period?: TrackingPeriod | null): boolean {
  if (!period) return true;
  if (period.start_date && dateStr < period.start_date) return false;
  if (period.end_date && dateStr > period.end_date) return false;
  return true;
}

/**
 * Formats today's date in local YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats current local time in HH:mm (24h)
 */
export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

