import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '@/utils/constants';
import { getCurrentTimeString, getTodayDateString } from '@/utils/calculations';
import { TransactionType } from '@/types';
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
}) => {
  const { wallets, activePeriod, addTransaction, transferBetweenWallets } = useFinance();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Lunch');
  const [walletId, setWalletId] = useState<string>('');
  const [toWalletId, setToWalletId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [time, setTime] = useState<string>(getCurrentTimeString());
  const [description, setDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      const defaultW = wallets.find(w => w.is_default) || wallets[0];
      setWalletId(defaultW.id);
      if (wallets.length > 1) {
        const otherW = wallets.find(w => w.id !== defaultW.id);
        if (otherW) setToWalletId(otherW.id);
      }
    }
  }, [wallets, walletId]);

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setAmount('');
      setDescription('');
      setNotes('');
      setDate(getTodayDateString());
      setTime(getCurrentTimeString());
      setCategory(defaultType === 'income' ? 'Freelancing' : 'Lunch');
    }
  }, [isOpen, defaultType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      if (type === 'transfer') {
        if (!walletId || !toWalletId || walletId === toWalletId) {
          alert('Please select two distinct wallets for the transfer.');
          setIsSubmitting(false);
          return;
        }
        await transferBetweenWallets(walletId, toWalletId, numAmount, notes);
      } else {
        const selectedW = wallets.find(w => w.id === walletId);
        const catList = type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
        const matchedCat = catList.find(c => c.name === category);

        await addTransaction({
          type,
          amount: numAmount,
          category_name: category,
          category_icon: matchedCat?.icon || 'Tag',
          wallet_id: walletId,
          wallet_name: selectedW?.name || 'Wallet',
          tracking_period_id: activePeriod?.id,
          date,
          time,
          description: description.trim() || category,
          notes: notes.trim(),
          payment_method: selectedW?.name || 'Cash',
          is_reviewed: false,
        });
      }

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Failed to submit transaction:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'bn' ? 'আর্থিক হিসাব লিপিবদ্ধকরণ' : 'Financial Entry'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-100 text-xs font-bold border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory('Lunch');
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'bn' ? 'খরচ' : 'Expense'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory('Freelancing');
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'bn' ? 'আয়' : 'Income'}</span>
          </button>

          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              type === 'transfer'
                ? 'bg-white text-slate-900 border border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'bn' ? 'ট্রান্সফার' : 'Transfer'}</span>
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            {language === 'bn' ? 'পরিমাণ' : 'Amount'}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-emerald-600">
              {user?.currency_symbol || '৳'}
            </span>
            <input
              type="number"
              step="any"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full pl-12 pr-4 py-3 text-2xl font-black rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 outline-none tnum"
            />
          </div>
        </div>

        {/* Category if not transfer */}
        {type !== 'transfer' && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {type === 'expense' ? (language === 'bn' ? 'খরচের খাত' : 'Category') : (language === 'bn' ? 'আয়ের উৎস' : 'Income Source')}
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {(type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES).map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setCategory(c.name);
                    if (!description) setDescription(c.name);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    category === c.name
                      ? type === 'expense'
                        ? 'bg-rose-500 text-white shadow-2xs'
                        : 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wallets */}
        {type === 'transfer' ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                {language === 'bn' ? 'উৎস ওয়ালেট' : 'From'}
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id} disabled={w.id === toWalletId}>
                    {w.name} ({user?.currency_symbol || '৳'} {w.current_balance.toFixed(0)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                {language === 'bn' ? 'গন্তব্য ওয়ালেট' : 'To'}
              </label>
              <select
                value={toWalletId}
                onChange={(e) => setToWalletId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id} disabled={w.id === walletId}>
                    {w.name} ({user?.currency_symbol || '৳'} {w.current_balance.toFixed(0)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {type === 'expense' ? (language === 'bn' ? 'পরিশোধের ওয়ালেট' : 'Wallet') : (language === 'bn' ? 'জমার ওয়ালেট' : 'Deposit To')}
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} — {user?.currency_symbol || '৳'} {w.current_balance.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            {language === 'bn' ? 'বিবরণ' : 'Description'}
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Rice & Vegetables or Monthly Stipend"
            className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 outline-none"
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {language === 'bn' ? 'তারিখ' : 'Date'}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {language === 'bn' ? 'সময়' : 'Time'}
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            {isSubmitting
              ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
              : (language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
