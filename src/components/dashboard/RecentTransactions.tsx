import React from 'react';
import { Transaction } from '@/types';
import { formatCurrency, formatTimelineTime, formatDate } from '@/utils/formatters';
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, ChevronRight, ReceiptText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency: string;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  currency,
  onSelectTransaction,
}) => {
  const navigate = useNavigate();
  const recent = transactions.slice(0, 7);

  if (recent.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No transactions recorded yet</p>
        <p className="text-xs text-slate-400 mt-1">Tap the Quick Add (+) button to record your first expense</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Latest financial activities</p>
        </div>
        <button
          onClick={() => navigate('/transactions')}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        {recent.map((tx) => {
          const isExpense = tx.type === 'expense';
          const isIncome = tx.type === 'income';
          const isTransfer = tx.type === 'transfer';

          return (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction?.(tx)}
              className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 shadow-sm flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isExpense
                      ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                      : isIncome
                      ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                  }`}
                >
                  {isExpense && <ArrowDownRight className="w-5 h-5 stroke-[2.2]" />}
                  {isIncome && <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />}
                  {isTransfer && <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {tx.description}
                    </p>
                    {tx.category_name && (
                      <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {tx.category_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{formatDate(tx.date)}</span>
                    <span>•</span>
                    <span>{formatTimelineTime(tx.time)}</span>
                    <span>•</span>
                    <span className="truncate">{tx.wallet_name || 'Wallet'}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p
                  className={`text-sm sm:text-base font-bold tnum ${
                    isExpense
                      ? 'text-rose-600 dark:text-rose-400'
                      : isIncome
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {isExpense ? '-' : isIncome ? '+' : ''}
                  {formatCurrency(tx.amount, currency)}
                </p>
                <p className="text-[10px] text-slate-400 capitalize">{tx.payment_method || tx.type}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

