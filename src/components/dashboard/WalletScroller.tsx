import React from 'react';
import { Wallet as WalletModel } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { ArrowLeftRight, Plus, Building2, Smartphone, Banknote, Rocket, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WalletScrollerProps {
  wallets: WalletModel[];
  currency: string;
  onOpenTransfer: () => void;
  onAddWallet: () => void;
}

export const WalletScroller: React.FC<WalletScrollerProps> = ({
  wallets,
  currency,
  onOpenTransfer,
  onAddWallet,
}) => {
  const navigate = useNavigate();

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'bkash':
      case 'nagad':
        return Smartphone;
      case 'rocket':
        return Rocket;
      case 'bank':
        return Building2;
      case 'cash':
        return Banknote;
      default:
        return Layers;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Your Wallets</h3>
          <p className="text-xs text-slate-500">Reconciled balance across all accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransfer}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Transfer</span>
          </button>
          <button
            onClick={onAddWallet}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scroller */}
      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {wallets.map((wallet) => {
          const Icon = getWalletIcon(wallet.type);
          const isNegative = wallet.current_balance < 0;

          return (
            <div
              key={wallet.id}
              onClick={() => navigate('/wallets')}
              className="min-w-[170px] sm:min-w-[200px] flex-1 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs cursor-pointer hover:border-slate-300 transition-all active:scale-[0.99] relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 bottom-0 w-1"
                style={{ backgroundColor: wallet.color || '#10b981' }}
              />

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 truncate">
                  {wallet.name}
                </span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${wallet.color || '#10b981'}20`, color: wallet.color || '#10b981' }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h4
                  className={`text-lg sm:text-xl font-bold tracking-tight tnum ${
                    isNegative ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {formatCurrency(wallet.current_balance, currency)}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 tnum">
                  Opening: {formatCurrency(wallet.opening_balance, currency, false)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
