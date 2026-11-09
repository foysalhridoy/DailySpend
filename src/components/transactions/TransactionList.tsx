import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Transaction, TransactionType } from '@/types';
import { formatCurrency, formatDate, formatTimelineTime } from '@/utils/formatters';
import { exportTransactionsToCSV } from '@/utils/csvExporter';
import {
  Search,
  Download,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
} from 'lucide-react';

interface TransactionListProps {
  onEditTransaction?: (tx: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ onEditTransaction }) => {
  const { transactions, wallets, deleteTransaction } = useFinance();
  const { user } = useAuth();
  const { language } = useLanguage();
  const currency = user?.currency_symbol || '৳';

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [walletFilter, setWalletFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Filtered & Sorted Transactions
  const filteredList = useMemo(() => {
    let result = [...transactions];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        t => t.description.toLowerCase().includes(q) ||
             (t.category_name && t.category_name.toLowerCase().includes(q)) ||
             (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }

    if (walletFilter !== 'all') {
      result = result.filter(t => t.wallet_id === walletFilter || t.to_wallet_id === walletFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'date_desc') {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.time.localeCompare(a.time);
      }
      if (sortBy === 'date_asc') {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      }
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, walletFilter, sortBy]);

  const handleDelete = async (id: string) => {
    if (confirm(language === 'bn' ? 'এই লেনদেনটি মুছে ফেলতে চান?' : 'Delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  const handleExport = () => {
    exportTransactionsToCSV(filteredList);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {language === 'bn' ? 'সকল লেনদেন' : 'Transactions'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {filteredList.length} {language === 'bn' ? 'টি লেনদেনের রেকর্ড সংরক্ষিত' : 'recorded transactions'}
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === 'bn' ? 'সিএসভি এক্সপোর্ট' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'bn' ? 'বিবরণ বা ক্যাটাগরি দিয়ে খুঁজুন...' : 'Search description, category, or note...'}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'all')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium outline-none focus:bg-white focus:border-emerald-600"
          >
            <option value="all">{language === 'bn' ? 'সকল ধরন' : 'All Types'}</option>
            <option value="expense">{language === 'bn' ? 'শুধুমাত্র খরচ' : 'Expenses'}</option>
            <option value="income">{language === 'bn' ? 'শুধুমাত্র আয়' : 'Income'}</option>
            <option value="transfer">{language === 'bn' ? 'ট্রান্সফার' : 'Transfers'}</option>
          </select>

          {/* Wallet Filter */}
          <select
            value={walletFilter}
            onChange={(e) => setWalletFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium outline-none focus:bg-white focus:border-emerald-600"
          >
            <option value="all">{language === 'bn' ? 'সকল ওয়ালেট' : 'All Wallets'}</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium outline-none focus:bg-white focus:border-emerald-600 ml-auto"
          >
            <option value="date_desc">{language === 'bn' ? 'নতুন থেকে পুরাতন' : 'Newest'}</option>
            <option value="date_asc">{language === 'bn' ? 'পুরাতন থেকে নতুন' : 'Oldest'}</option>
            <option value="amount_desc">{language === 'bn' ? 'সর্বোচ্চ পরিমাণ' : 'Highest'}</option>
            <option value="amount_asc">{language === 'bn' ? 'সর্বনিম্ন পরিমাণ' : 'Lowest'}</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            {language === 'bn' ? 'কোনো লেনদেন পাওয়া যায়নি' : 'No matching transactions recorded'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredList.map((tx) => {
              const isExpense = tx.type === 'expense';
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="p-3.5 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
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
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {tx.description}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {tx.category_name || 'General'} • {tx.wallet_name} • {formatDate(tx.date)} {formatTimelineTime(tx.time)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 shrink-0">
                    <div className="text-right">
                      <p
                        className={`text-xs sm:text-sm font-bold tnum ${
                          isExpense ? 'text-rose-600' : isIncome ? 'text-emerald-600' : 'text-slate-800'
                        }`}
                      >
                        {isExpense ? '-' : isIncome ? '+' : ''}
                        {formatCurrency(tx.amount, currency)}
                      </p>
                      <p className="text-[10px] text-slate-400 capitalize">{tx.payment_method || tx.type}</p>
                    </div>

                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
