import React from 'react';
import { StatCard } from '@/components/common/StatCard';
import { FinancialStats } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { Wallet, TrendingDown, TrendingUp, Calendar, PiggyBank, Flame } from 'lucide-react';

interface FinancialOverviewProps {
  stats: FinancialStats;
  currency: string;
}

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({ stats, currency }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {/* Available Balance */}
      <div className="col-span-2 sm:col-span-1 xl:col-span-2">
        <StatCard
          title="Available Balance"
          amount={formatCurrency(stats.availableBalance, currency)}
          icon={Wallet}
          variant="emerald"
          subtext={`Opening: ${formatCurrency(stats.totalOpeningBalance, currency, false)}`}
          badge="Live"
        />
      </div>

      {/* Today's Expense */}
      <StatCard
        title="Today's Expense"
        amount={formatCurrency(stats.todayExpense, currency)}
        icon={Flame}
        variant="rose"
        subtext={stats.todayIncome > 0 ? `+${formatCurrency(stats.todayIncome, currency)} income` : undefined}
      />

      {/* Period Expenses */}
      <StatCard
        title="Period Expenses"
        amount={formatCurrency(stats.periodExpense, currency)}
        icon={TrendingDown}
        variant="rose"
        subtext="Total spending"
      />

      {/* Period Income */}
      <StatCard
        title="Period Income"
        amount={formatCurrency(stats.periodIncome, currency)}
        icon={TrendingUp}
        variant="emerald"
        subtext={`Net: ${formatCurrency(stats.netCashFlow, currency)}`}
      />

      {/* Remaining Budget / Avg Daily */}
      <StatCard
        title={stats.remainingBudget !== null ? 'Remaining Budget' : 'Avg. Daily Spend'}
        amount={
          stats.remainingBudget !== null
            ? formatCurrency(stats.remainingBudget, currency)
            : formatCurrency(stats.averageDailyExpense, currency)
        }
        icon={stats.remainingBudget !== null ? PiggyBank : Calendar}
        variant={stats.remainingBudget !== null && stats.remainingBudget < 0 ? 'rose' : 'indigo'}
        subtext={stats.remainingBudget !== null ? 'Period target' : 'Per active day'}
      />
    </div>
  );
};

