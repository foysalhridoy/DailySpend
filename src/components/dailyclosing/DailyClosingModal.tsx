import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { getTodayDateString } from '@/utils/calculations';
import { CheckCircle2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DailyClosingView: React.FC = () => {
  const { transactions, stats, saveDailyClosing, isDayClosed } = useFinance();
  const { user } = useAuth();
  const navigate = useNavigate();
  const currency = user?.currency_symbol || '৳';

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Filter transactions for chosen date
  const dayTransactions = useMemo(() => {
    return transactions.filter(t => t.date === selectedDate);
  }, [transactions, selectedDate]);

  const dayExpenses = useMemo(() => {
    return dayTransactions.filter(t => t.type === 'expense');
  }, [dayTransactions]);

  const dayIncome = useMemo(() => {
    return dayTransactions.filter(t => t.type === 'income');
  }, [dayTransactions]);

  const totalExpense = dayExpenses.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const totalIncome = dayIncome.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  // Most expensive transaction
  const mostExpensive = useMemo(() => {
    if (dayExpenses.length === 0) return null;
    return [...dayExpenses].sort((a, b) => b.amount - a.amount)[0];
  }, [dayExpenses]);

  // Category breakdown for day
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of dayExpenses) {
      const cat = t.category_name || 'General';
      map[cat] = (map[cat] || 0) + (Number(t.amount) || 0);
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [dayExpenses]);

  const dayAlreadyClosed = isDayClosed(selectedDate);

  const handleConfirmClose = async () => {
    await saveDailyClosing({
      date: selectedDate,
      total_income: totalIncome,
      total_expense: totalExpense,
      closing_balance: stats.availableBalance,
      is_reviewed: true,
      notes: closingNotes,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Daily Reconciliation & Closing</h2>
        <p className="text-xs text-slate-500">
          Verify today's transactions, ensure balance integrity, and generate closing records
        </p>
      </div>

      {/* Date Picker */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-slate-700">Closing Date:</span>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-emerald-600"
        />
      </div>

      {/* Status Banner */}
      {dayAlreadyClosed && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>This day has already been reconciled and marked as closed.</span>
          </div>
          <button
            onClick={() => navigate(`/receipts?date=${selectedDate}`)}
            className="font-bold underline text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            Receipt
          </button>
        </div>
      )}

      {/* Daily Summary Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Summary for {formatDate(selectedDate, 'MMMM d, yyyy')}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-500">Total Spent</span>
            <p className="text-lg font-bold text-rose-600 tnum mt-1">
              {formatCurrency(totalExpense, currency)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-500">Total Inflow</span>
            <p className="text-lg font-bold text-emerald-600 tnum mt-1">
              {formatCurrency(totalIncome, currency)}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-slate-500">Current Balance</span>
            <p className="text-lg font-bold text-slate-900 tnum mt-1">
              {formatCurrency(stats.availableBalance, currency)}
            </p>
          </div>
        </div>

        {/* Most Expensive Item */}
        {mostExpensive && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Highest Single Expense:</span>
              <p className="font-semibold text-slate-800">{mostExpensive.description}</p>
            </div>
            <span className="font-bold text-rose-600 tnum">
              {formatCurrency(mostExpensive.amount, currency)}
            </span>
          </div>
        )}

        {/* Categories */}
        {categoryBreakdown.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Category Distribution
            </span>
            <div className="space-y-1">
              {categoryBreakdown.map(([cat, amt]) => (
                <div key={cat} className="flex justify-between items-center text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-600">{cat}</span>
                  <span className="font-semibold text-slate-900 tnum">{formatCurrency(amt, currency)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Closing Notes & Confirmation */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <label className="block text-xs font-semibold text-slate-700">
          Daily Closing Notes / Reconciled Observations:
        </label>
        <textarea
          value={closingNotes}
          onChange={(e) => setClosingNotes(e.target.value)}
          rows={3}
          placeholder="e.g., Physical cash counted and matched, all receipts recorded..."
          className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 outline-none resize-none"
        />

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => navigate(`/receipts?date=${selectedDate}`)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Preview Daily Thermal Receipt
          </button>

          <button
            onClick={handleConfirmClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            {isSaved ? 'Reconciliation Saved!' : 'Confirm Daily Closing'}
          </button>
        </div>
      </div>
    </div>
  );
};
