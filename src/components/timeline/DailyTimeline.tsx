import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Transaction } from '@/types';
import { formatCurrency, formatTimelineTime, formatDate } from '@/utils/formatters';
import {
  Calendar,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  ReceiptText,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DailyTimelineProps {
  onSelectTransaction?: (tx: Transaction) => void;
  onGenerateDailyReceipt?: (dateStr: string) => void;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({
  onSelectTransaction,
  onGenerateDailyReceipt,
}) => {
  const { transactions, deleteTransaction } = useFinance();
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const currency = user?.currency_symbol || '৳';

  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');

  const groupedByDate = useMemo(() => {
    const groups: Record<string, { date: string; items: Transaction[]; totalExpense: number; totalIncome: number }> = {};

    let list = [...transactions];
    if (selectedDateFilter) {
      list = list.filter(t => t.date === selectedDateFilter);
    }

    list.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.time.localeCompare(b.time);
    });

    for (const tx of list) {
      if (!groups[tx.date]) {
        groups[tx.date] = {
          date: tx.date,
          items: [],
          totalExpense: 0,
          totalIncome: 0,
        };
      }
      groups[tx.date].items.push(tx);
      if (tx.type === 'expense') {
        groups[tx.date].totalExpense += Number(tx.amount) || 0;
      } else if (tx.type === 'income') {
        groups[tx.date].totalIncome += Number(tx.amount) || 0;
      }
    }

    return Object.values(groups);
  }, [transactions, selectedDateFilter]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(language === 'bn' ? 'লেনদেনটি মুছে ফেলতে চান?' : 'Delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {language === 'bn' ? 'দৈনিক টাইমলাইন' : 'Daily Timeline'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn' ? 'দিনভিত্তিক খরচের ধারাবাহিক তালিকা ও মোট হিসাব' : 'Chronological transactions grouped by day'}
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-900 outline-none focus:border-emerald-600 shadow-2xs"
          />
          {selectedDateFilter && (
            <button
              onClick={() => setSelectedDateFilter('')}
              className="text-xs text-emerald-600 font-semibold hover:underline cursor-pointer"
            >
              {language === 'bn' ? 'মুছুন' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {groupedByDate.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">
            {language === 'bn' ? 'কোনো টাইমলাইন রেকর্ড পাওয়া যায়নি' : 'No timeline records found'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByDate.map((group) => (
            <div key={group.date} className="space-y-2.5">
              {/* Date Header */}
              <div className="sticky top-14 z-20 bg-[#F8F9FA]/95 backdrop-blur-md py-2.5 px-1 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 text-emerald-600 shadow-2xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900">
                      {formatDate(group.date, 'EEEE, MMMM d, yyyy')}
                    </h2>
                    <p className="text-[10px] text-slate-400">
                      {group.items.length} {language === 'bn' ? 'টি লেনদেন' : 'transactions'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    {group.totalExpense > 0 && (
                      <p className="text-xs font-bold text-rose-600 tnum">
                        {language === 'bn' ? 'ব্যয়: ' : 'Spent: '}
                        {formatCurrency(group.totalExpense, currency)}
                      </p>
                    )}
                    {group.totalIncome > 0 && (
                      <p className="text-[10px] font-bold text-emerald-600 tnum">
                        +{formatCurrency(group.totalIncome, currency)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (onGenerateDailyReceipt) {
                        onGenerateDailyReceipt(group.date);
                      } else {
                        navigate(`/receipts?date=${group.date}`);
                      }
                    }}
                    className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
                    title="Generate Receipt"
                  >
                    <ReceiptText className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>
              </div>

              {/* Transactions in group */}
              <div className="space-y-2">
                {group.items.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  const isIncome = tx.type === 'income';

                  return (
                    <div
                      key={tx.id}
                      onClick={() => onSelectTransaction?.(tx)}
                      className="px-4 py-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isExpense
                              ? 'bg-rose-50 text-rose-600 border border-rose-100'
                              : isIncome
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isExpense && <ArrowDownRight className="w-4 h-4 stroke-[2.2]" />}
                          {isIncome && <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />}
                          {!isExpense && !isIncome && <ArrowLeftRight className="w-4 h-4 stroke-[2.2]" />}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{tx.description}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {formatTimelineTime(tx.time)} • {tx.category_name || 'General'} • {tx.wallet_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-xs font-bold tnum ${
                            isExpense ? 'text-rose-600' : isIncome ? 'text-emerald-600' : 'text-slate-800'
                          }`}
                        >
                          {isExpense ? '-' : isIncome ? '+' : ''}
                          {formatCurrency(tx.amount, currency)}
                        </span>

                        <button
                          onClick={(e) => handleDelete(e, tx.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 transition-all rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
