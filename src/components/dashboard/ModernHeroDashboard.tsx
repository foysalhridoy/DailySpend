import React, { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  Home,
  Coins,
  Receipt,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  Gamepad2,
  Building,
  ArrowRight,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface ModernHeroDashboardProps {
  onQuickAdd: () => void;
  onOpenTransfer: () => void;
}

export const ModernHeroDashboard: React.FC<ModernHeroDashboardProps> = ({
  onQuickAdd,
  onOpenTransfer,
}) => {
  const { stats, transactions, activePeriod, wallets } = useFinance();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const currency = user?.currency_symbol || '৳';

  // Compute breakdown for Planned / Category spendings
  const categorySplit = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === 'expense') {
        const cat = tx.category_name || 'General';
        map[cat] = (map[cat] || 0) + (Number(tx.amount) || 0);
      }
    }
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const total = stats.periodExpense || 1;

    return entries.slice(0, 3).map(([name, val]) => ({
      name,
      value: val,
      percentage: Math.round((val / total) * 100),
    }));
  }, [transactions, stats.periodExpense]);

  // Donut chart data with screenshot colors: Pure White, Neon Lime, Dark Charcoal
  const donutData = useMemo(() => {
    if (categorySplit.length === 0) {
      return [
        { name: 'Home', value: 55, color: '#FFFFFF' },
        { name: 'Business', value: 30, color: '#B6F035' },
        { name: 'Education', value: 15, color: '#2C2C2E' },
      ];
    }
    const colors = ['#FFFFFF', '#B6F035', '#2C2C2E'];
    return categorySplit.map((c, i) => ({
      name: c.name,
      value: c.value,
      color: colors[i % colors.length],
    }));
  }, [categorySplit]);

  // Compute 2x2 Bento card metrics
  const bentoMetrics = useMemo(() => {
    // 1. Income after bills = Total Income - Bills
    const billsTotal = transactions
      .filter(t => t.type === 'expense' && (t.category_name?.toLowerCase().includes('bill') || t.category_name?.toLowerCase().includes('utility')))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const incomeAfterBills = Math.max(0, stats.periodIncome - billsTotal);

    // 2. Planned spending / period target or total expense
    const plannedTarget = activePeriod?.spending_target || stats.periodExpense * 1.2 || 15000;

    // 3. Other spending
    const foodAndTransport = transactions
      .filter(t => t.type === 'expense' && (t.category_name === 'Lunch' || t.category_name === 'Dinner' || t.category_name === 'Breakfast' || t.category_name === 'Rickshaw' || t.category_name === 'Bus'))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const otherSpending = Math.max(0, stats.periodExpense - foodAndTransport - billsTotal);

    return {
      incomeAfterBills,
      plannedTarget,
      otherSpending: otherSpending > 0 ? otherSpending : foodAndTransport,
      billsTotal: billsTotal > 0 ? billsTotal : Math.round(stats.periodExpense * 0.25),
    };
  }, [stats, transactions, activePeriod]);

  // Recent upcoming/scheduled items simulation or latest transactions
  const upcomingItems = useMemo(() => {
    const list = transactions.slice(0, 2);
    if (list.length >= 2) {
      return [
        {
          id: '1',
          title: list[0].description,
          amount: list[0].amount,
          type: list[0].type,
          subtext: `${list[0].category_name || 'Expense'} • ${formatDate(list[0].date)}`,
          icon: Building,
        },
        {
          id: '2',
          title: list[1].description,
          amount: list[1].amount,
          type: list[1].type,
          subtext: `${list[1].category_name || 'Income'} • ${formatDate(list[1].date)}`,
          icon: Gamepad2,
        },
      ];
    }
    return [
      {
        id: '1',
        title: language === 'bn' ? 'বাড়ি ভাড়া' : 'Home Rental',
        amount: 8500,
        type: 'expense',
        subtext: language === 'bn' ? '৫ দিন পর প্রদেয়' : 'in 5 days',
        icon: Building,
      },
      {
        id: '2',
        title: language === 'bn' ? 'ফ্রিল্যান্সিং প্রাপ্তি' : 'Games payback',
        amount: 12500,
        type: 'income',
        subtext: language === 'bn' ? '৭ দিন পর জমা' : 'in 7 days',
        icon: Gamepad2,
      },
    ];
  }, [transactions, language]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* =========================================================================
          SCREEN 1: HERO BUDGET & 2X2 BENTO GAUGES (Direct reference from left image)
         ========================================================================= */}
      <section className="space-y-5">
        {/* Top Hero Budget Header */}
        <div className="pt-2">
          <p className="text-xs sm:text-sm font-medium text-slate-400 tracking-wide">
            {t.yourBudget}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight tnum">
              {stats.availableBalance.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </h1>
            <span className="text-sm sm:text-lg font-bold text-[#B6F035] uppercase tracking-wider">
              {user?.currency_code || 'BDT'}
            </span>
          </div>
        </div>

        {/* 2x2 Bento Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1: Income after bills */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#1C1C1F] border border-[#2A2A2E] flex flex-col justify-between min-h-[145px] hover:border-[#38383D] transition-all">
            <div className="flex items-center justify-between">
              {/* Circular Gauge Ring with Icon Inside */}
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#B6F035]"
                    strokeDasharray="75, 100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 m-auto w-7 h-7 rounded-full bg-[#121214] flex items-center justify-center text-white">
                  <Home className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Trend Arrow */}
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#B6F035] tnum">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+{stats.periodIncome.toFixed(0)}</span>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                {t.incomeAfterBills}
              </p>
              <h3 className="text-lg sm:text-2xl font-bold text-white tnum mt-0.5">
                {formatCurrency(bentoMetrics.incomeAfterBills, currency, false)}
              </h3>
            </div>
          </div>

          {/* Card 2: Planned spending */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#1C1C1F] border border-[#2A2A2E] flex flex-col justify-between min-h-[145px] hover:border-[#38383D] transition-all">
            <div className="flex items-center justify-between">
              {/* Circular Gauge Ring */}
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#B6F035]"
                    strokeDasharray="60, 100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 m-auto w-7 h-7 rounded-full bg-[#121214] flex items-center justify-center text-white">
                  <Coins className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Trend Arrow */}
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300 tnum">
                <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>-{stats.periodExpense.toFixed(0)}</span>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                {t.plannedSpending}
              </p>
              <h3 className="text-lg sm:text-2xl font-bold text-white tnum mt-0.5">
                {formatCurrency(bentoMetrics.plannedTarget, currency, false)}
              </h3>
            </div>
          </div>

          {/* Card 3: Other spending (Squircle icon badge) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#1C1C1F] border border-[#2A2A2E] flex flex-col justify-between min-h-[145px] hover:border-[#38383D] transition-all">
            <div className="flex items-center justify-between">
              {/* Squircle Badge */}
              <div className="w-10 h-10 rounded-2xl border-2 border-[#B6F035] bg-[#121214] flex items-center justify-center text-[#B6F035]">
                <ShoppingBag className="w-4 h-4" />
              </div>

              {/* Trend Arrow */}
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300 tnum">
                <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>-{bentoMetrics.otherSpending.toFixed(0)}</span>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                {t.otherSpending}
              </p>
              <h3 className="text-lg sm:text-2xl font-bold text-white tnum mt-0.5">
                {formatCurrency(bentoMetrics.otherSpending, currency, false)}
              </h3>
            </div>
          </div>

          {/* Card 4: Bills */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#1C1C1F] border border-[#2A2A2E] flex flex-col justify-between min-h-[145px] hover:border-[#38383D] transition-all">
            <div className="flex items-center justify-between">
              {/* Circular Gauge Ring */}
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#B6F035]"
                    strokeDasharray="45, 100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 m-auto w-7 h-7 rounded-full bg-[#121214] flex items-center justify-center text-white">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Trend Arrow */}
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300 tnum">
                <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>-{bentoMetrics.billsTotal.toFixed(0)}</span>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                {t.bills}
              </p>
              <h3 className="text-lg sm:text-2xl font-bold text-white tnum mt-0.5">
                {formatCurrency(bentoMetrics.billsTotal, currency, false)}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SCREEN 2: PLANNED SPENDINGS DONUT & WHITE UPCOMING SHEET (Right image)
         ========================================================================= */}
      <section className="pt-3 space-y-5">
        {/* Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {language === 'bn' ? 'পরিকল্পিত' : 'Planned'} <br />
            {language === 'bn' ? 'ব্যয় ও লক্ষ্য' : 'spendings'}
          </h2>
        </div>

        {/* Centerpiece Segmented Donut with Floating Labels */}
        <div className="relative py-4 flex flex-col items-center justify-center">
          <div className="w-56 h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={92}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`donut-${index}`} fill={entry.color} stroke="#121214" strokeWidth={3} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Stat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl sm:text-3xl font-black text-white tnum">
                {formatCurrency(stats.periodExpense || 200, currency, false)}
              </span>
            </div>
          </div>

          {/* Floating Percentages (Left & Right labels like in the screenshot) */}
          <div className="w-full flex items-center justify-between px-2 pt-2 text-xs">
            {/* Left Tag */}
            <div className="space-y-0.5 text-left">
              <p className="text-sm font-bold text-white">55%</p>
              <p className="text-[11px] text-slate-400 font-medium">Home & Living</p>
            </div>

            {/* Right Tags */}
            <div className="space-y-2 text-right">
              <div>
                <p className="text-sm font-bold text-[#B6F035]">30%</p>
                <p className="text-[11px] text-slate-400 font-medium">Business / Food</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-300">15%</p>
                <p className="text-[11px] text-slate-400 font-medium">Education / Transport</p>
              </div>
            </div>
          </div>
        </div>

        {/* High-Contrast White Card: UPCOMING TRANSACTIONS (Exact replica of bottom section) */}
        <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {t.upcoming}
            </h3>
            <button
              onClick={() => navigate('/timeline')}
              className="text-xs font-bold text-slate-600 hover:text-black flex items-center gap-1"
            >
              <span>{t.viewAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Side-by-side Dark Squircle Cards inside the White Surface */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {upcomingItems.map((item) => {
              const Icon = item.icon;
              const isPositive = item.type === 'income';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#18181A] text-white flex flex-col justify-between min-h-[140px] shadow-md hover:bg-[#202024] transition-all cursor-pointer"
                  onClick={() => navigate('/timeline')}
                >
                  <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>

                  <div className="mt-3">
                    <h4 className="text-lg font-black tracking-tight tnum">
                      {isPositive ? '+' : ''}{formatCurrency(item.amount, currency, false)}
                    </h4>
                    <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {item.subtext}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

