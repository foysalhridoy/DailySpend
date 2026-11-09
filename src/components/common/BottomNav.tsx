import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListOrdered, Wallet, PieChart, Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface BottomNavProps {
  onQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onQuickAdd }) => {
  const { t, language } = useLanguage();

  const navItems = [
    { to: '/', label: t.dashboard, icon: LayoutDashboard },
    { to: '/transactions', label: language === 'bn' ? 'লেনদেন' : 'Ledger', icon: ListOrdered },
    { to: '/analytics', label: language === 'bn' ? 'প্ল্যানিং' : 'Planned', icon: PieChart },
    { to: '/wallets', label: t.wallets, icon: Wallet },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 md:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))] no-print shadow-lg transition-colors">
      <div className="flex items-center justify-around px-3 h-16 relative max-w-md mx-auto">
        {/* Left items */}
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-14 py-1 transition-all ${
                  isActive
                    ? 'text-emerald-600 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  <span className="text-[10px] mt-1 tracking-tight truncate max-w-[54px]">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* Center Emerald Quick Add Button */}
        <div className="relative -top-4 flex flex-col items-center">
          <button
            onClick={onQuickAdd}
            className="w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 hover:scale-105 transition-all cursor-pointer"
            aria-label="Add Expense"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
          <span className="text-[9px] font-bold text-slate-500 tracking-wider mt-1">
            {t.quickAdd}
          </span>
        </div>

        {/* Right items */}
        {navItems.slice(2, 4).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-14 py-1 transition-all ${
                  isActive
                    ? 'text-emerald-600 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  <span className="text-[10px] mt-1 tracking-tight truncate max-w-[54px]">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
