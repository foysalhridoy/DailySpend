import React, { useMemo } from 'react';
import { Transaction } from '@/types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface SpendingChartsProps {
  transactions: Transaction[];
  currency: string;
}

export const SpendingCharts: React.FC<SpendingChartsProps> = ({ transactions, currency }) => {
  // 1. Prepare Daily Spending Data (last 7 days)
  const dailyData = useMemo(() => {
    const daysMap: Record<string, number> = {};
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      daysMap[dateStr] = 0;
    }

    for (const t of transactions) {
      if (t.type === 'expense' && daysMap[t.date] !== undefined) {
        daysMap[t.date] += Number(t.amount) || 0;
      }
    }

    return Object.entries(daysMap).map(([date, amount]) => {
      const d = new Date(date);
      return {
        date,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        amount,
      };
    });
  }, [transactions]);

  // 2. Prepare Category Breakdown Data (Top 5 categories + Others)
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};

    for (const t of transactions) {
      if (t.type === 'expense') {
        const cat = t.category_name || 'Other';
        catMap[cat] = (catMap[cat] || 0) + (Number(t.amount) || 0);
      }
    }

    const sorted = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    if (sorted.length <= 5) return sorted;

    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5).reduce((acc, curr) => acc + curr.value, 0);
    return [...top5, { name: 'Others', value: others }];
  }, [transactions]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 7-Day Expense Bar Chart */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="mb-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Daily Spending Trend</h4>
          <p className="text-xs text-slate-500">Expenses over the past 7 days</p>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${currency}${val}`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs shadow-lg border border-slate-800">
                        <p className="font-semibold text-slate-300">{data.date}</p>
                        <p className="text-emerald-400 font-bold mt-0.5 tnum">
                          {formatCurrency(data.amount, currency)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown Donut */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="mb-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Category Distribution</h4>
          <p className="text-xs text-slate-500">Breakdown of period expenses</p>
        </div>

        {categoryData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-xs text-slate-400">
            No expenses recorded yet
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4 h-52">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2 rounded-xl bg-slate-900 text-white text-xs shadow-lg border border-slate-800">
                            <p className="font-semibold text-slate-300">{data.name}</p>
                            <p className="text-emerald-400 font-bold tnum">
                              {formatCurrency(data.value, currency)}
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

            {/* Legend list */}
            <div className="w-full sm:w-1/2 space-y-1.5 overflow-y-auto max-h-36 pr-1">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-slate-600 dark:text-slate-300 truncate font-medium">
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-slate-900 dark:text-white font-semibold tnum shrink-0">
                    {formatCurrency(entry.value, currency, false)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

