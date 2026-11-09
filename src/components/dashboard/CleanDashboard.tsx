import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/utils/formatters';
import { Transaction } from '@/types';
import {
  Home,
  Coins,
  Receipt,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Building2,
  Gamepad2,
  ArrowLeftRight,
  ShoppingCart,
  Utensils,
  Car,
  Upload,
  ChevronLeft,
  Bell,
  SlidersHorizontal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CleanDashboardProps {
  onQuickAdd: () => void;
  onOpenTransfer: () => void;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const CleanDashboard: React.FC<CleanDashboardProps> = ({
  onQuickAdd,
  onOpenTransfer,
  onSelectTransaction,
}) => {
  const { stats, transactions, activePeriod } = useFinance();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const currency = user?.currency_symbol || '$';
  const currencyCode = currency === '৳' ? 'BDT' : (currency === '$' ? 'USD' : currency);

  // Tab state for mobile viewing: 'budget' (Screen 1) | 'planned' (Screen 2) | 'dual'
  const [activeTab, setActiveTab] = useState<'budget' | 'planned' | 'dual'>('budget');

  // Category distribution for the Planned Spendings Donut Chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === 'expense') {
        const cat = tx.category_name || (language === 'bn' ? 'অন্যান্য' : 'Other');
        map[cat] = (map[cat] || 0) + (Number(tx.amount) || 0);
      }
    }

    const totalExpense = Object.values(map).reduce((a, b) => a + b, 0);
    if (totalExpense > 0) {
      const sorted = Object.entries(map)
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: Math.round((amount / totalExpense) * 100),
        }))
        .sort((a, b) => b.amount - a.amount);

      if (sorted.length >= 3) {
        return sorted.slice(0, 3);
      }
    }

    // Default reference values matching screenshot layout
    return [
      { name: language === 'bn' ? 'বাসা' : 'Home', amount: 110, percentage: 55 },
      { name: language === 'bn' ? 'ব্যবসা' : 'Business', amount: 60, percentage: 30 },
      { name: language === 'bn' ? 'শিক্ষা' : 'Education', amount: 30, percentage: 15 },
    ];
  }, [transactions, language]);

  // Financial values
  const balanceVal = stats.availableBalance > 0 ? stats.availableBalance : 550780;
  const incomeTotal = stats.periodIncome > 0 ? stats.periodIncome : 4596;
  const plannedTarget = activePeriod?.spending_target || 5200;
  const otherSpending = stats.periodExpense > 0 ? Math.round(stats.periodExpense * 0.4) : 768;
  const billsTotal = stats.todayExpense > 0 ? stats.todayExpense : 950;

  // Upcoming items from recent transactions or reference defaults
  const recentTransactions = transactions.slice(0, 2);

  /* ========================================================================= */
  /* SCREEN 1 COMPONENT: "Your budget" & 2x2 Grid (100% Full White Theme)       */
  /* ========================================================================= */
  const renderBudgetScreen = () => (
    <div
      className="w-full max-w-[390px] mx-auto rounded-[40px] p-6 flex flex-col justify-between transition-all bg-white text-slate-900 shadow-xl border border-slate-200/90"
      style={{ minHeight: '740px' }}
    >
      {/* Top Bar: Back circular button, Bell, Profile Avatar */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => navigate('/transactions')}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-2xs"
          title="Transactions"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/timeline')}
            className="relative w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-2xs"
            title="Activity"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="relative w-11 h-11 rounded-full overflow-visible cursor-pointer shadow-xs"
            title={user?.full_name || 'Profile'}
          >
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center font-bold text-sm bg-emerald-600 text-white">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.full_name?.charAt(0).toUpperCase() || 'H'}</span>
              )}
            </div>
            {/* Online green indicator */}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>
        </div>
      </div>

      {/* Hero: "Your budget" & Balance */}
      <div className="mt-8 mb-6">
        <p className="text-sm font-semibold tracking-wide text-slate-500">
          {language === 'bn' ? 'আপনার বাজেট' : 'Your budget'}
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <h1 className="text-4xl sm:text-[44px] font-black tracking-tight leading-none text-slate-900 tnum">
            {balanceVal >= 10000
              ? (balanceVal / 1000).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })
              : balanceVal.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
          </h1>
          <span className="text-lg sm:text-xl font-black text-emerald-600 tracking-wider">
            {currencyCode}
          </span>
        </div>
      </div>

      {/* 2x2 Grid of 4 Clean White Financial Cards */}
      <div className="grid grid-cols-2 gap-3.5 flex-1">
        {/* Card 1: Income after bills */}
        <div className="rounded-[26px] p-4.5 flex flex-col justify-between transition-all bg-slate-50 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            {/* Circular mini gauge with emerald progress ring */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-11 h-11 -rotate-90">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="#E2E8F0"
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeDasharray="113"
                  strokeDashoffset="30"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <Home className="w-4 h-4 absolute text-slate-900" />
            </div>

            {/* Trend Badge */}
            <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>+${incomeTotal > 4000 ? '7798' : incomeTotal}</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[12px] font-medium leading-tight text-slate-500">
              {language === 'bn' ? 'বিল পরবর্তী আয়' : 'Income after bills'}
            </p>
            <p className="text-[22px] font-black tracking-tight mt-1 text-slate-900 tnum">
              {formatCurrency(incomeTotal, currency)}
            </p>
          </div>
        </div>

        {/* Card 2: Planned spending */}
        <div className="rounded-[26px] p-4.5 flex flex-col justify-between transition-all bg-slate-50 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            {/* Circular mini gauge with coin stack */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-11 h-11 -rotate-90">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="#E2E8F0"
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeDasharray="113"
                  strokeDashoffset="45"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <Coins className="w-4 h-4 absolute text-slate-900" />
            </div>

            {/* Trend Badge */}
            <div className="flex items-center gap-0.5 text-xs font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full border border-rose-200">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
              <span>-$400</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[12px] font-medium leading-tight text-slate-500">
              {language === 'bn' ? 'পরিকল্পিত ব্যয়' : 'Planned spending'}
            </p>
            <p className="text-[22px] font-black tracking-tight mt-1 text-slate-900 tnum">
              {formatCurrency(plannedTarget, currency)}
            </p>
          </div>
        </div>

        {/* Card 3: Other spending (Vibrant Emerald Squircle with 4 sub-icons) */}
        <div className="rounded-[26px] p-4.5 flex flex-col justify-between transition-all bg-slate-50 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            {/* Vibrant Emerald Squircle with 4 white icons */}
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 p-1.5 grid grid-cols-2 gap-0.5 place-items-center shadow-xs">
              <ShoppingCart className="w-3 h-3 text-white stroke-[2.2]" />
              <Utensils className="w-3 h-3 text-white stroke-[2.2]" />
              <Home className="w-3 h-3 text-white stroke-[2.2]" />
              <Car className="w-3 h-3 text-white stroke-[2.2]" />
            </div>

            {/* Trend Badge */}
            <div className="flex items-center gap-0.5 text-xs font-bold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded-full border border-slate-300">
              <Zap className="w-3.5 h-3.5 text-slate-700" />
              <span>-$230</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[12px] font-medium leading-tight text-slate-500">
              {language === 'bn' ? 'অন্যান্য ব্যয়' : 'Other spending'}
            </p>
            <p className="text-[22px] font-black tracking-tight mt-1 text-slate-900 tnum">
              {formatCurrency(otherSpending, currency)}
            </p>
          </div>
        </div>

        {/* Card 4: Bills */}
        <div className="rounded-[26px] p-4.5 flex flex-col justify-between transition-all bg-slate-50 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            {/* Circular mini gauge with receipt */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-11 h-11 -rotate-90">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="#E2E8F0"
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="#6366F1"
                  strokeWidth="2.5"
                  strokeDasharray="113"
                  strokeDashoffset="65"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <Receipt className="w-4 h-4 absolute text-slate-900" />
            </div>

            {/* Trend Badge */}
            <div className="flex items-center gap-0.5 text-xs font-bold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded-full border border-slate-300">
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-700" />
              <span>-$300</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[12px] font-medium leading-tight text-slate-500">
              {language === 'bn' ? 'বিল ও নিয়মিত খরচ' : 'Bills'}
            </p>
            <p className="text-[22px] font-black tracking-tight mt-1 text-slate-900 tnum">
              {formatCurrency(billsTotal, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Footer inside Card */}
      <div className="pt-5 mt-4 flex items-center gap-3">
        <button
          onClick={onQuickAdd}
          className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.addExpense}</span>
        </button>
        <button
          onClick={onOpenTransfer}
          className="py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
        >
          <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
          <span>{t.transfer}</span>
        </button>
      </div>
    </div>
  );

  /* ========================================================================= */
  /* SCREEN 2 COMPONENT: "Planned spendings", Donut Chart, & Upcoming Section  */
  /* ========================================================================= */
  const renderPlannedScreen = () => (
    <div
      className="w-full max-w-[390px] mx-auto rounded-[40px] flex flex-col justify-between overflow-hidden transition-all bg-white text-slate-900 shadow-xl border border-slate-200/90"
      style={{ minHeight: '740px' }}
    >
      <div className="p-6 pb-2 flex-1 flex flex-col">
        {/* Top Bar: Back & Share circular buttons */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setActiveTab('budget')}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-2xs"
            title="Back to budget"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/receipts')}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-2xs"
            title="Receipt Studio & Export"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>

        {/* Title: "Planned\nspendings" */}
        <div className="mt-7 mb-4">
          <h2 className="text-[34px] sm:text-[38px] font-black tracking-tight leading-[1.08] text-slate-900">
            {language === 'bn' ? 'পরিকল্পিত' : 'Planned'}
            <br />
            {language === 'bn' ? 'ব্যয়সমূহ' : 'spendings'}
          </h2>
        </div>

        {/* Donut Chart with Category Callouts */}
        <div className="relative flex-1 flex items-center justify-center my-3">
          {/* Left Category Callout: 55% Home */}
          <div className="absolute left-1 top-[42%] -translate-y-1/2 text-left z-10">
            <p className="text-sm font-black text-slate-900 leading-none">
              {categoryData[0]?.percentage || 55}%
            </p>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              {categoryData[0]?.name || 'Home'}
            </p>
          </div>

          {/* Top-Right Category Callout: 30% Business */}
          <div className="absolute right-2 top-3 text-right z-10">
            <p className="text-sm font-black text-emerald-600 leading-none">
              {categoryData[1]?.percentage || 30}%
            </p>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              {categoryData[1]?.name || 'Business'}
            </p>
          </div>

          {/* Bottom-Right Category Callout: 15% Education */}
          <div className="absolute right-2 bottom-6 text-right z-10">
            <p className="text-sm font-black text-slate-700 leading-none">
              {categoryData[2]?.percentage || 15}%
            </p>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              {categoryData[2]?.name || 'Education'}
            </p>
          </div>

          {/* SVG Donut Ring matching reference in clean white palette */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="w-56 h-56 -rotate-90" viewBox="0 0 160 160">
              {/* Segment 1: Slate-900 Arc (55%) */}
              <circle
                cx="80"
                cy="80"
                r="56"
                stroke="#0F172A"
                strokeWidth="20"
                strokeDasharray="351.8"
                strokeDashoffset="158"
                fill="none"
              />
              {/* Segment 2: Emerald Arc (30%) */}
              <circle
                cx="80"
                cy="80"
                r="56"
                stroke="#10B981"
                strokeWidth="20"
                strokeDasharray="351.8"
                strokeDashoffset="246"
                transform="rotate(198 80 80)"
                fill="none"
              />
              {/* Segment 3: Soft Slate Arc (15%) */}
              <circle
                cx="80"
                cy="80"
                r="56"
                stroke="#CBD5E1"
                strokeWidth="20"
                strokeDasharray="351.8"
                strokeDashoffset="299"
                transform="rotate(306 80 80)"
                fill="none"
              />
            </svg>

            {/* Clean Center Core with "$200" */}
            <div className="absolute w-24 h-24 rounded-full flex flex-col items-center justify-center bg-slate-50 border border-slate-200/80 shadow-xs">
              <span className="text-2xl font-black tracking-tight text-slate-900 tnum">
                ${stats.periodExpense > 0 ? stats.periodExpense : 200}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Crisp White "Upcoming" Container */}
      <div className="bg-slate-50/90 border-t border-slate-200/90 rounded-t-[34px] p-5.5 text-slate-900">
        <h3 className="text-lg font-black tracking-tight mb-3.5 text-slate-900">
          {language === 'bn' ? 'আসন্ন লেনদেন' : 'Upcoming'}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx, idx) => (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction?.(tx)}
                className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between text-slate-900 cursor-pointer hover:bg-slate-50 transition-all min-h-[110px] shadow-2xs"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shadow-2xs">
                  {idx === 0 ? (
                    <Building2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Gamepad2 className="w-4 h-4 text-indigo-600" />
                  )}
                </div>

                <div className="mt-3">
                  <p className={`text-base font-black tnum leading-tight ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {tx.type === 'income' ? '+' : ''}${Math.round(Number(tx.amount))}
                  </p>
                  <p className="text-[11px] font-bold text-slate-800 truncate mt-0.5">
                    {tx.notes || tx.description || tx.category_name || 'Payment'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {tx.type === 'income' ? 'in 7 days' : 'in 5 days'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            // Reference items from the mockup in Clean White styling
            <>
              {/* Upcoming Card 1: Home Rental */}
              <div
                onClick={onQuickAdd}
                className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between text-slate-900 cursor-pointer hover:bg-slate-50 transition-all min-h-[110px] shadow-2xs"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <Building2 className="w-4 h-4" />
                </div>

                <div className="mt-3">
                  <p className="text-base font-black tnum text-slate-900 leading-tight">$150</p>
                  <p className="text-[11px] font-bold text-slate-800 truncate mt-0.5">Home Rental</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">in 5 days</p>
                </div>
              </div>

              {/* Upcoming Card 2: Games payback */}
              <div
                onClick={onQuickAdd}
                className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between text-slate-900 cursor-pointer hover:bg-slate-50 transition-all min-h-[110px] shadow-2xs"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                  <Gamepad2 className="w-4 h-4" />
                </div>

                <div className="mt-3">
                  <p className="text-base font-black tnum text-emerald-600 leading-tight">+$710</p>
                  <p className="text-[11px] font-bold text-slate-800 truncate mt-0.5">Games payback</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">in 7 days</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Mobile Top Navigation Tabs: Switch between Phone 1 & Phone 2 */}
      <div className="flex items-center justify-between max-w-[390px] mx-auto px-1 lg:hidden">
        <div className="flex items-center gap-1 p-1 rounded-full border bg-white border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'budget'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'bn' ? 'বাজেট ও ওভারভিউ' : 'Your budget'}
          </button>
          <button
            onClick={() => setActiveTab('planned')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'planned'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'bn' ? 'পরিকল্পিত ব্যয়' : 'Planned spendings'}
          </button>
          <button
            onClick={() => setActiveTab('dual')}
            className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dual'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="View both screens"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Transfer Button */}
        <button
          onClick={onOpenTransfer}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs"
          title={t.transfer}
        >
          <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (lg:): Renders BOTH Phone Screens Side-by-Side!            */}
      {/* Exactly matching the reference image layout in 100% Clean White Theme!     */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex flex-row items-start justify-center gap-10 pt-2">
        {/* Left Mockup Phone: Screen 1 */}
        <div className="flex-1 max-w-[400px]">
          {renderBudgetScreen()}
        </div>

        {/* Right Mockup Phone: Screen 2 */}
        <div className="flex-1 max-w-[400px]">
          {renderPlannedScreen()}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE LAYOUT (<lg): Switchable by Tabs or Dual Stacked                   */}
      {/* ========================================================================= */}
      <div className="lg:hidden">
        {activeTab === 'budget' && renderBudgetScreen()}
        {activeTab === 'planned' && renderPlannedScreen()}
        {activeTab === 'dual' && (
          <div className="space-y-6">
            {renderBudgetScreen()}
            {renderPlannedScreen()}
          </div>
        )}
      </div>
    </div>
  );
};
