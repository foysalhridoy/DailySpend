import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ThermalReceiptView } from './ThermalReceiptView';
import { ReceiptData, ReceiptFormat, ReceiptType } from '@/types';
import { getTodayDateString, getCurrentTimeString } from '@/utils/calculations';
import { ReceiptText, Calendar, Clock, FileText } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const ReceiptStudio: React.FC = () => {
  const { transactions, activePeriod, trackingPeriods, wallets, stats } = useFinance();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();

  const queryDate = searchParams.get('date');

  const [receiptType, setReceiptType] = useState<ReceiptType>(queryDate ? 'daily' : 'daily');
  const [format, setFormat] = useState<ReceiptFormat>('58mm');
  const [selectedTxId, setSelectedTxId] = useState<string>(transactions[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(queryDate || getTodayDateString());
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(activePeriod?.id || '');

  const currency = user?.currency_symbol || '৳';

  // Construct ReceiptData based on receiptType
  const receiptData: ReceiptData = useMemo(() => {
    const receiptNumber = `DS-${Math.floor(100000 + Math.random() * 900000)}`;
    const today = getTodayDateString();
    const time = getCurrentTimeString();
    const userName = user?.full_name || 'DailySpend User';

    if (receiptType === 'individual') {
      const tx = transactions.find(t => t.id === selectedTxId) || transactions[0];
      if (!tx) {
        return {
          receiptNumber,
          date: today,
          time,
          title: 'Individual Expense Receipt',
          userName,
          currency,
          items: [],
          totalExpense: 0,
          totalIncome: 0,
        };
      }

      return {
        receiptNumber,
        date: tx.date,
        time: tx.time,
        title: 'Individual Transaction Receipt',
        userName,
        currency,
        items: [
          {
            description: tx.description,
            category: tx.category_name,
            amount: tx.amount,
            wallet: tx.wallet_name,
            time: tx.time,
          },
        ],
        totalExpense: tx.type === 'expense' ? tx.amount : 0,
        totalIncome: tx.type === 'income' ? tx.amount : 0,
        paymentMethod: tx.payment_method || tx.wallet_name,
      };
    }

    if (receiptType === 'daily') {
      const dayTransactions = transactions.filter(t => t.date === selectedDate);
      const dayExpenses = dayTransactions.filter(t => t.type === 'expense');
      const totalExpense = dayExpenses.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      const totalIncome = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

      return {
        receiptNumber,
        date: selectedDate,
        time,
        title: `Daily Financial Statement (${selectedDate})`,
        userName,
        currency,
        items: dayTransactions.map(t => ({
          description: t.description,
          category: t.category_name,
          amount: t.amount,
          wallet: t.wallet_name,
          time: t.time,
        })),
        totalExpense,
        totalIncome,
      };
    }

    if (receiptType === 'period') {
      const period = trackingPeriods.find(p => p.id === selectedPeriodId) || activePeriod;
      const periodTransactions = transactions.filter(t => !period || t.tracking_period_id === period.id);
      const totalExpense = periodTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      const totalIncome = periodTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

      return {
        receiptNumber,
        date: today,
        time,
        title: `Period Statement: ${period?.name || 'Current'}`,
        userName,
        currency,
        items: periodTransactions.slice(0, 15).map(t => ({
          description: t.description,
          category: t.category_name,
          amount: t.amount,
          wallet: t.wallet_name,
          time: t.date,
        })),
        totalExpense,
        totalIncome,
        openingBalance: stats.totalOpeningBalance,
        closingBalance: stats.availableBalance,
      };
    }

    // Summary
    return {
      receiptNumber,
      date: today,
      time,
      title: 'Overall Financial Summary',
      userName,
      currency,
      items: wallets.map(w => ({
        description: `Wallet: ${w.name}`,
        amount: w.current_balance,
      })),
      totalExpense: stats.periodExpense,
      totalIncome: stats.periodIncome,
      openingBalance: stats.totalOpeningBalance,
      closingBalance: stats.availableBalance,
    };
  }, [receiptType, selectedTxId, selectedDate, selectedPeriodId, transactions, activePeriod, trackingPeriods, wallets, stats, user, currency]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      {/* Header */}
      <div className="no-print">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {language === 'bn' ? 'রসিদ ও স্টেটমেন্ট স্টুডিও' : 'Receipt Studio'}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'bn' ? 'থার্মাল প্রিন্টার রসিদ (৫৮মিমি, ৮০মিমি) ও পিডিএফ এক্সপোর্ট' : 'Design, preview, print, and download thermal receipts (58mm, 80mm)'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Panel (Hidden in Print) */}
        <div className="lg:col-span-5 space-y-4 no-print">
          {/* Receipt Type Tabs */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              {language === 'bn' ? 'রসিদের ধরন' : 'Receipt Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReceiptType('daily')}
                className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  receiptType === 'daily'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Daily Expense</span>
              </button>

              <button
                type="button"
                onClick={() => setReceiptType('individual')}
                className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  receiptType === 'individual'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ReceiptText className="w-4 h-4 text-emerald-600" />
                <span>Single Tx</span>
              </button>

              <button
                type="button"
                onClick={() => setReceiptType('period')}
                className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  receiptType === 'period'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Period Statement</span>
              </button>

              <button
                type="button"
                onClick={() => setReceiptType('summary')}
                className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  receiptType === 'summary'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Overall Summary</span>
              </button>
            </div>
          </div>

          {/* Context Filter Selector */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              {language === 'bn' ? 'উৎস নির্বাচন' : 'Source Selection'}
            </label>

            {receiptType === 'daily' && (
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">{language === 'bn' ? 'তারিখ' : 'Select Day'}</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>
            )}

            {receiptType === 'individual' && (
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">{language === 'bn' ? 'লেনদেন নির্বাচন' : 'Select Transaction'}</label>
                <select
                  value={selectedTxId}
                  onChange={(e) => setSelectedTxId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-emerald-600 font-medium"
                >
                  {transactions.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.date} — {t.description} ({currency} {t.amount})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {receiptType === 'period' && (
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">{language === 'bn' ? 'ট্র্যাকিং পিরিয়ড' : 'Select Tracking Period'}</label>
                <select
                  value={selectedPeriodId}
                  onChange={(e) => setSelectedPeriodId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-emerald-600 font-medium"
                >
                  {trackingPeriods.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.start_date} to {p.end_date || 'now'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Paper Format Selector */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              {language === 'bn' ? 'প্রিন্ট পেপার সাইজ' : 'Print Format'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('58mm')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  format === '58mm'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                58mm Thermal
              </button>
              <button
                type="button"
                onClick={() => setFormat('80mm')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  format === '80mm'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                80mm Thermal
              </button>
              <button
                type="button"
                onClick={() => setFormat('a4')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  format === 'a4'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                A4 Standard
              </button>
            </div>
          </div>
        </div>

        {/* Right Live Thermal Preview & Print Output */}
        <div className="lg:col-span-7 flex flex-col items-center w-full">
          <div className="w-full bg-slate-100/70 p-3 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 flex justify-center overflow-visible">
            <ThermalReceiptView data={receiptData} format={format} />
          </div>
        </div>
      </div>
    </div>
  );
};
