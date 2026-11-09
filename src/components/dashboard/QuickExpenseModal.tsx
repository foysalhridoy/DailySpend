import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/common/Modal';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { DEFAULT_EXPENSE_CATEGORIES } from '@/utils/constants';
import { getCurrentTimeString, getTodayDateString } from '@/utils/calculations';
import { Check } from 'lucide-react';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({ isOpen, onClose }) => {
  const { wallets, activePeriod, addTransaction } = useFinance();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [amount, setAmount] = useState<string>('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Lunch');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      const defaultW = wallets.find(w => w.is_default) || wallets[0];
      setSelectedWalletId(defaultW.id);
    }
  }, [wallets, selectedWalletId]);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDescription('');
      setSelectedCategory('Lunch');
      setSuccess(false);
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const quickAmounts = [50, 100, 200, 500, 1000];

  const handleAddQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    if (!description || DEFAULT_EXPENSE_CATEGORIES.some(c => c.name === description)) {
      setDescription(catName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    if (!selectedWalletId) return;

    setIsSubmitting(true);
    try {
      const wallet = wallets.find(w => w.id === selectedWalletId);
      const cat = DEFAULT_EXPENSE_CATEGORIES.find(c => c.name === selectedCategory);

      await addTransaction({
        type: 'expense',
        amount: numAmount,
        category_name: selectedCategory,
        category_icon: cat?.icon || 'Tag',
        wallet_id: selectedWalletId,
        wallet_name: wallet?.name || 'Wallet',
        tracking_period_id: activePeriod?.id,
        date: getTodayDateString(),
        time: getCurrentTimeString(),
        description: description.trim() || selectedCategory,
        payment_method: wallet?.name || 'Cash',
        is_reviewed: false,
      });

      setSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 600);
    } catch (err) {
      console.error('Error adding quick expense:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'bn' ? 'নতুন খরচ যোগ করুন' : 'Add Expense'}
      maxWidth="md"
    >
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <p className="text-sm font-bold text-slate-900">
            {language === 'bn' ? 'খরচ সফলভাবে সংরক্ষিত হয়েছে' : 'Expense recorded successfully'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {language === 'bn' ? 'টাকার পরিমাণ' : 'Amount'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-emerald-600">
                {user?.currency_symbol || '৳'}
              </span>
              <input
                ref={amountInputRef}
                type="number"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full pl-12 pr-4 py-3 text-3xl font-black rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 outline-none tnum transition-all"
              />
            </div>

            {/* Quick Increment Pills */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 no-scrollbar">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleAddQuickAmount(q)}
                  className="px-3 py-1 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  +{q}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {DEFAULT_EXPENSE_CATEGORIES.slice(0, 12).map((c) => {
                const isSelected = selectedCategory === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleCategorySelect(c.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {language === 'bn' ? 'বিবরণ (ঐচ্ছিক)' : 'Note (Optional)'}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'bn' ? 'যেমন: দুপুরের খাবার' : 'e.g. Lunch with team'}
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 outline-none"
            />
          </div>

          {/* Wallet Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {language === 'bn' ? 'ওয়ালেট নির্বাচন' : 'Pay From Wallet'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {wallets.map((w) => {
                const isSelected = selectedWalletId === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSelectedWalletId(w.id)}
                    className={`p-3 rounded-2xl text-left text-xs transition-all border cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="truncate font-semibold">{w.name}</p>
                    <p className="text-[11px] text-slate-500 tnum mt-0.5">
                      {user?.currency_symbol || '৳'} {w.current_balance.toFixed(0)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              {isSubmitting
                ? language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'
                : language === 'bn' ? 'খরচ নিশ্চিত করুন' : 'Confirm Expense'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
