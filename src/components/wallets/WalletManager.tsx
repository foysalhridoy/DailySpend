import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Wallet, WalletType } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import {
  Plus,
  ArrowLeftRight,
  Edit2,
  Trash2,
  CreditCard,
  Smartphone,
  Banknote,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { WalletTransferModal } from './WalletTransferModal';

export const WalletManager: React.FC = () => {
  const { wallets, addWallet, updateWallet, deleteWallet } = useFinance();
  const { user } = useAuth();
  const { language } = useLanguage();
  const currency = user?.currency_symbol || '৳';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('cash');
  const [openingBalance, setOpeningBalance] = useState('');

  const handleOpenAdd = () => {
    setEditingWallet(null);
    setName('');
    setType('cash');
    setOpeningBalance('0');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (w: Wallet) => {
    setEditingWallet(w);
    setName(w.name);
    setType(w.type);
    setOpeningBalance(w.opening_balance.toString());
    setIsAddOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ob = parseFloat(openingBalance) || 0;

    if (editingWallet) {
      await updateWallet(editingWallet.id, {
        name,
        type,
        opening_balance: ob,
      });
    } else {
      await addWallet({
        name,
        type,
        opening_balance: ob,
        color: '#10B981',
        icon: 'wallet',
        is_default: false,
      });
    }
    setIsAddOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(language === 'bn' ? 'এই ওয়ালেটটি মুছে ফেলতে চান?' : 'Delete this wallet?')) {
      await deleteWallet(id);
    }
  };

  const getWalletIcon = (wType: WalletType) => {
    switch (wType) {
      case 'bkash':
      case 'nagad':
      case 'rocket':
        return <Smartphone className="w-5 h-5 text-emerald-600" />;
      case 'bank':
        return <CreditCard className="w-5 h-5 text-indigo-600" />;
      case 'cash':
      default:
        return <Banknote className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {language === 'bn' ? 'ওয়ালেট ও অ্যাকাউন্ট' : 'Wallets & Accounts'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn' ? 'ক্যাশ, ব্যাংক এবং মোবাইল ওয়ালেট ব্যালেন্স পর্যবেক্ষণ' : 'Manage your cash, bank accounts, and mobile wallets'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'bn' ? 'ফান্ড ট্রান্সফার' : 'Transfer'}</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{language === 'bn' ? 'নতুন ওয়ালেট' : 'Add Wallet'}</span>
          </button>
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((wallet) => {
          const isNegative = wallet.current_balance < 0;

          return (
            <div
              key={wallet.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      {getWalletIcon(wallet.type)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {wallet.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 capitalize">
                        {wallet.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(wallet)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!wallet.is_default && (
                      <button
                        onClick={() => handleDelete(wallet.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-0.5 mt-2">
                  <p className="text-[11px] text-slate-400 font-medium">
                    {language === 'bn' ? 'বর্তমান ব্যালেন্স' : 'Current Balance'}
                  </p>
                  <h4
                    className={`text-2xl font-black tracking-tight tnum ${
                      isNegative ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {formatCurrency(wallet.current_balance, currency)}
                  </h4>
                  <p className="text-[10px] text-slate-400 tnum pt-0.5">
                    {language === 'bn' ? 'প্রারম্ভিক মূলধন: ' : 'Opening Capital: '}
                    {formatCurrency(wallet.opening_balance, currency, false)}
                  </p>
                </div>
              </div>

              {wallet.is_default && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-emerald-600 font-bold">
                  <span>{language === 'bn' ? 'ডিফল্ট ওয়ালেট' : 'Default Account'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Wallet Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={editingWallet ? (language === 'bn' ? 'ওয়ালেট এডিট করুন' : 'Edit Wallet') : (language === 'bn' ? 'নতুন ওয়ালেট তৈরি করুন' : 'New Wallet')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {language === 'bn' ? 'ওয়ালেটের নাম' : 'Wallet Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. bKash, Bank, Cash"
              required
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {language === 'bn' ? 'ওয়ালেটের ধরন' : 'Wallet Type'}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as WalletType)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
            >
              <option value="cash">{language === 'bn' ? 'ক্যাশ (নগদ)' : 'Cash'}</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
              <option value="bank">{language === 'bn' ? 'ব্যাংক একাউন্ট' : 'Bank Account'}</option>
              <option value="other">{language === 'bn' ? 'অন্যান্য' : 'Custom Wallet'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {language === 'bn' ? 'শুরুর স্থিতি (আয় হিসেবে গণ্য হবে না)' : 'Opening Balance (Not counted as income)'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {currency}
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 outline-none tnum"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              {editingWallet
                ? (language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes')
                : (language === 'bn' ? 'ওয়ালেট যোগ করুন' : 'Create Wallet')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Transfer Funds Modal */}
      <WalletTransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />
    </div>
  );
};
