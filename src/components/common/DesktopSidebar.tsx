import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListOrdered,
  Wallet,
  PieChart,
  Settings,
  LogOut,
  Plus,
  Receipt,
  Clock,
  Target,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { SyncBadge } from './SyncBadge';
import { SyncStatus } from '@/types';

interface DesktopSidebarProps {
  syncStatus: SyncStatus;
  onQuickAdd: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ syncStatus, onQuickAdd }) => {
  const { user, signOut } = useAuth();
  const { language, t } = useLanguage();

  const navigation = [
    { to: '/', label: t.dashboard, icon: LayoutDashboard },
    { to: '/transactions', label: language === 'bn' ? 'সকল লেনদেন' : 'Transactions', icon: ListOrdered },
    { to: '/timeline', label: language === 'bn' ? 'টাইমলাইন' : 'Timeline', icon: Clock },
    { to: '/analytics', label: language === 'bn' ? 'পরিকল্পিত ব্যয়' : 'Planned Spend', icon: PieChart },
    { to: '/budgets', label: language === 'bn' ? 'বাজেট' : 'Budgets', icon: Target },
    { to: '/wallets', label: t.wallets, icon: Wallet },
    { to: '/receipts', label: language === 'bn' ? 'রসিদ স্টুডিও' : 'Receipt Studio', icon: Receipt },
    { to: '/settings', label: t.settings, icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 shrink-0 select-none no-print border-r bg-white border-slate-200/90 text-slate-900 transition-colors">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-xs bg-emerald-50 border border-emerald-200 text-emerald-600">
            ৳
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none text-slate-900">
              DailySpend
            </h1>
            <p className="text-[10px] font-medium tracking-wider mt-1 text-slate-400">
              Personal Finance
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="p-3">
        <button
          onClick={onQuickAdd}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.addExpense}</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 stroke-[2]" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200/90 space-y-2.5">
        <SyncBadge status={syncStatus} />

        {user && (
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold truncate text-slate-900">{user.full_name}</p>
              <p className="text-[10px] font-medium truncate text-slate-400">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-1.5 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
