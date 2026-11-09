import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { generateAnalyticsReportPDF } from '@/utils/pdfGenerator';
import { exportTransactionsToCSV } from '@/utils/csvExporter';
import {
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AnalyticsDashboard: React.FC = () => {
  const { transactions, stats, activePeriod } = useFinance();
  const { user } = useAuth();
  const { language } = useLanguage();
  const currency = user?.currency_symbol || '৳';

  const [chartView, setChartView] = useState<'daily' | 'weekly'>('daily');

  // 1. Progress Graph Data
  const progressData = useMemo(() => {
    if (chartView === 'daily') {
      const days: Record<string, { label: string; spent: number }> = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });
        days[dateKey] = { label, spent: 0 };
      }

      for (const tx of transactions) {
        if (tx.type === 'expense' && days[tx.date]) {
          days[tx.date].spent += Number(tx.amount) || 0;
        }
      }

      return Object.entries(days).map(([date, item]) => ({
        date,
        name: item.label,
        spent: item.spent,
      }));
    } else {
      const weeks = [
        { name: language === 'bn' ? 'সপ্তাহ ১' : 'W1', spent: 0 },
        { name: language === 'bn' ? 'সপ্তাহ ২' : 'W2', spent: 0 },
        { name: language === 'bn' ? 'সপ্তাহ ৩' : 'W3', spent: 0 },
        { name: language === 'bn' ? 'চলতি সপ্তাহ' : 'This Wk', spent: 0 },
      ];

      const today = new Date();
      for (const tx of transactions) {
        if (tx.type === 'expense') {
          const tDate = new Date(tx.date);
          const diffDays = Math.floor((today.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays < 7) {
            weeks[3].spent += Number(tx.amount) || 0;
          } else if (diffDays < 14) {
            weeks[2].spent += Number(tx.amount) || 0;
          } else if (diffDays < 21) {
            weeks[1].spent += Number(tx.amount) || 0;
          } else if (diffDays < 28) {
            weeks[0].spent += Number(tx.amount) || 0;
          }
        }
      }

      return weeks;
    }
  }, [transactions, chartView, language]);

  // 2. Round Graph Data
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === 'expense') {
        const cat = tx.category_name || (language === 'bn' ? 'অন্যান্য' : 'Other');
        map[cat] = (map[cat] || 0) + (Number(tx.amount) || 0);
      }
    }

    const totalExpense = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    const sorted = Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: Math.round((amount / totalExpense) * 100),
      }))
      .sort((a, b) => b.amount - a.amount);

    if (sorted.length === 0) {
      return [
        { name: language === 'bn' ? 'বাসা' : 'Home', amount: 550, percentage: 55 },
        { name: language === 'bn' ? 'ব্যবসা' : 'Business', amount: 300, percentage: 30 },
        { name: language === 'bn' ? 'শিক্ষা' : 'Education', amount: 150, percentage: 15 },
      ];
    }
    return sorted;
  }, [transactions, language]);

  const COLORS = ['#10B981', '#0284C7', '#F59E0B', '#6366F1', '#EC4899', '#64748B'];

  const handleDownloadPDF = () => {
    const doc = generateAnalyticsReportPDF(stats, currency, activePeriod?.name || 'All-Time');
    doc.save(`DailySpend_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions, `DailySpend_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {language === 'bn' ? 'পরিকল্পিত ব্যয় ও বিশ্লেষণ' : 'Planned Spend & Insights'}
          </h1>
          <p className="text-xs mt-0.5 text-slate-500">
            {language === 'bn' ? 'খরচের গতিশীলতা ও ক্যাটাগরিভিত্তিক ট্রেন্ড' : 'Summary of spending velocity and category trends'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-xs transition-colors shadow-xs cursor-pointer bg-white hover:bg-slate-50 border border-slate-200 text-slate-700"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{language === 'bn' ? 'পিডিএফ রিপোর্ট' : 'PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">
            {language === 'bn' ? 'নেট ক্যাশ ফ্লো' : 'Net Cash Flow'}
          </p>
          <h2
            className={`text-xl font-black mt-1 tnum ${
              stats.netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-500'
            }`}
          >
            {formatCurrency(stats.netCashFlow, currency)}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">
            {language === 'bn' ? 'দৈনিক গড় ব্যয়' : 'Avg. Daily Spend'}
          </p>
          <h2 className="text-xl font-black mt-1 text-slate-900 tnum">
            {formatCurrency(stats.averageDailyExpense, currency)}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">
            {language === 'bn' ? 'সর্বোচ্চ ব্যয়ের দিন' : 'Peak Spending Day'}
          </p>
          <h2 className="text-xl font-black mt-1 text-rose-500 tnum">
            {stats.highestSpendingDay ? formatCurrency(stats.highestSpendingDay.amount, currency, false) : '—'}
          </h2>
          <p className="text-[10px] truncate mt-0.5 text-slate-400">
            {stats.highestSpendingDay ? formatDate(stats.highestSpendingDay.date) : ''}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">
            {language === 'bn' ? 'শীর্ষ খরচের খাত' : 'Top Category'}
          </p>
          <h2 className="text-xl font-black mt-1 truncate text-slate-900">
            {stats.topCategory ? stats.topCategory.name : '—'}
          </h2>
          <p className="text-[10px] font-semibold truncate mt-0.5 text-emerald-600">
            {stats.topCategory ? `${stats.topCategory.percentage}% of expenses` : ''}
          </p>
        </div>
      </div>

      {/* The Two Main Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Progress Graph */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'bn' ? 'ব্যয় অগ্রগতি চার্ট' : 'Spending Velocity'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {chartView === 'daily' ? 'Last 7 days' : 'Last 4 weeks'}
              </p>
            </div>

            <div className="flex items-center p-1 rounded-full text-xs font-semibold bg-slate-100">
              <button
                type="button"
                onClick={() => setChartView('daily')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  chartView === 'daily'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {language === 'bn' ? 'দৈনিক' : 'Daily'}
              </button>
              <button
                type="button"
                onClick={() => setChartView('weekly')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  chartView === 'weekly'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {language === 'bn' ? 'সাপ্তাহিক' : 'Weekly'}
              </button>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendingFillAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={{ stroke: '#F1F5F9' }} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="px-3 py-2 rounded-xl text-xs shadow-md border bg-white border-slate-200 text-slate-900">
                          <p className="text-slate-500">{data.name}</p>
                          <p className="font-black tnum mt-0.5 text-emerald-600">
                            {formatCurrency(data.spent, currency)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="spent" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#spendingFillAnalytics)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Round Graph */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'bn' ? 'ক্যাটাগরিভিত্তিক অনুপাত' : 'Expense Distribution'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {language === 'bn' ? 'মোট ব্যয়ের শতাংশ' : 'Breakdown by category'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-4 pt-1">
            <div className="w-40 h-40 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="amount"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="px-3 py-1.5 rounded-xl text-xs shadow-md border bg-white border-slate-200 text-slate-900">
                            <p className="font-bold">{data.name}</p>
                            <p className="tnum text-emerald-600">
                              {formatCurrency(data.amount, currency)} ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full space-y-2 max-h-40 overflow-y-auto pr-1">
              {categoryData.slice(0, 4).map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="truncate font-medium text-slate-600">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold tnum shrink-0 text-slate-900">
                    <span>{formatCurrency(item.amount, currency, false)}</span>
                    <span className="text-[11px] w-8 text-right font-black text-emerald-600">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
