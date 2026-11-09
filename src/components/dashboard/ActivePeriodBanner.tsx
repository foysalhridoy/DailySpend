import React from 'react';
import { TrackingPeriod } from '@/types';
import { Calendar, Target, Clock, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';

interface ActivePeriodBannerProps {
  period: TrackingPeriod | null;
  periodExpense: number;
  currency: string;
}

export const ActivePeriodBanner: React.FC<ActivePeriodBannerProps> = ({
  period,
  periodExpense,
  currency,
}) => {
  const navigate = useNavigate();

  if (!period) {
    return (
      <div className="rounded-2xl p-4 bg-white border border-slate-200/90 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">No Active Tracking Period</h4>
            <p className="text-xs text-slate-500">Set a flexible date range & spending target</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/periods')}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors cursor-pointer shadow-xs"
        >
          Create Period
        </button>
      </div>
    );
  }

  const target = period.spending_target || 0;
  const percentage = target > 0 ? Math.min(100, Math.round((periodExpense / target) * 100)) : 0;
  const isOverTarget = target > 0 && periodExpense > target;

  return (
    <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 shadow-xs text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Period
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">{period.name}</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {period.start_date} {period.end_date ? `to ${period.end_date}` : '(Ongoing)'}
            </span>
            {target > 0 && (
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                Target: {formatCurrency(target, currency)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/periods')}
          className="self-start sm:self-auto flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <span>Manage Cycles</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {target > 0 && (
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-500 font-medium">
              Spent so far: <strong className="text-slate-900 font-bold tnum">{formatCurrency(periodExpense, currency)}</strong>
            </span>
            <span className={`font-bold ${isOverTarget ? 'text-rose-600' : 'text-emerald-600'}`}>
              {percentage}% {isOverTarget && '(Over Target)'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isOverTarget ? 'bg-rose-500' : percentage > 85 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
