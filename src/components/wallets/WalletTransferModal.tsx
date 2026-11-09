import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowLeftRight } from 'lucide-react';

interface WalletTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletTransferModal: React.FC<WalletTransferModalProps> = ({ isOpen, onClose }) => {
  const { wallets, transferBetweenWallets } = useFinance();
  const { user } = useAuth();
  const { language } = useLanguage();
  const currency = user?.currency_symbol || '৳';

  const [fromId, setFromId] = useState<string>(wallets[0]?.id || '');
  const [toId, setToId] = useState<string>(wallets[1]?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    if (fromId === toId) {
      alert(language === 'bn' ? 'দুটি ভিন্ন ওয়ালেট নির্বাচন করুন।' : 'Source and destination wallets must be different.');
      return;
    }

    setIsSubmitting(true);
    try {
      await transferBetweenWallets(fromId, toId, num, notes);
      setIsSubmitting(false);
      setAmount('');
      setNotes('');
      onClose();
    } catch (err) {
      console.error('Transfer error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'bn' ? 'ওয়ালেট ফান্ড স্থানান্তর' : 'Transfer Between Wallets'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-500">
          {language === 'bn'
            ? 'এক অ্যাকাউন্ট থেকে অন্য অ্যাকাউন্টে অর্থ স্থানান্তর। এটি আপনার মোট ব্যালেন্স অপরিবর্তিত রেখে ওয়ালেট আপডেট করে।'
            : 'Move funds between accounts without affecting your overall net profit or loss.'}
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            {language === 'bn' ? 'স্থানান্তরের পরিমাণ' : 'Transfer Amount'}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-emerald-600">
              {currency}
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {language === 'bn' ? 'উৎস ওয়ালেট' : 'From Wallet'}
            </label>
            <select
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id} disabled={w.id === toId}>
                  {w.name} ({currency} {w.current_balance.toFixed(0)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {language === 'bn' ? 'গন্তব্য ওয়ালেট' : 'To Wallet'}
            </label>
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id} disabled={w.id === fromId}>
                  {w.name} ({currency} {w.current_balance.toFixed(0)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            {language === 'bn' ? 'নোট (ঐচ্ছিক)' : 'Note (Optional)'}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={language === 'bn' ? 'যেমন: এটিএম ক্যাশ উত্তোলন' : 'e.g. ATM cash withdrawal'}
            className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 outline-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
            <span>{isSubmitting ? (language === 'bn' ? 'স্থানান্তর হচ্ছে...' : 'Transferring...') : (language === 'bn' ? 'স্থানান্তর সম্পন্ন করুন' : 'Complete Transfer')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
