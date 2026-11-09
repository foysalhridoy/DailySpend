import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { TrackingPeriod } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { getTodayDateString } from '@/utils/calculations';
import {
  CalendarRange,
  Plus,
  CheckCircle2,
  Lock,
  RotateCcw,
  Target,
  Edit2,
  Copy,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';

export const TrackingPeriodManager: React.FC = () => {
  const {
    trackingPeriods,
    addTrackingPeriod,
    updateTrackingPeriod,
    setActivePeriod,
    closeTrackingPeriod,
    reopenTrackingPeriod,
    transactions,
  } = useFinance();
  const { user } = useAuth();
  const { language } = useLanguage();
  const currency = user?.currency_symbol || '৳';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<TrackingPeriod | null>(null);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState('');
  const [spendingTarget, setSpendingTarget] = useState('');
  const [notes, setNotes] = useState('');
  const [makeActive, setMakeActive] = useState(true);

  const handleOpenCreate = () => {
    setEditingPeriod(null);
    setName('Weekly Track');
    setStartDate(getTodayDateString());

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setEndDate(nextWeek.toISOString().split('T')[0]);
    setSpendingTarget('10000');
    setNotes('');
    setMakeActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: TrackingPeriod) => {
    setEditingPeriod(p);
    setName(p.name);
    setStartDate(p.start_date);
    setEndDate(p.end_date || '');
    setSpendingTarget(p.spending_target?.toString() || '');
    setNotes(p.notes || '');
    setMakeActive(p.is_active);
    setIsModalOpen(true);
  };

  const handleDuplicate = (p: TrackingPeriod) => {
    setEditingPeriod(null);
    setName(`${p.name} (Copy)`);
    setStartDate(getTodayDateString());
    setEndDate('');
    setSpendingTarget(p.spending_target?.toString() || '');
    setNotes(p.notes || '');
    setMakeActive(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = spendingTarget ? parseFloat(spendingTarget) : undefined;

    if (editingPeriod) {
      await updateTrackingPeriod(editingPeriod.id, {
        name,
        start_date: startDate,
        end_date: endDate || undefined,
        spending_target: targetNum,
        notes,
        is_active: makeActive,
      });
      if (makeActive) {
        await setActivePeriod(editingPeriod.id);
      }
    } else {
      await addTrackingPeriod({
        name,
        start_date: startDate,
        end_date: endDate || undefined,
        spending_target: targetNum,
        status: 'active',
        is_active: makeActive,
        notes,
      });
    }

    setIsModalOpen(false);
  };

  const getPeriodSpent = (p: TrackingPeriod) => {
    return transactions
      .filter(t => t.tracking_period_id === p.id || (t.date >= p.start_date && (!p.end_date || t.date <= p.end_date)))
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {language === 'bn' ? 'কাস্টম ট্র্যাকিং পিরিয়ড' : 'Tracking Periods'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn' ? 'ক্যালেন্ডার মাসের বাইরে ইচ্ছামতো ৭ দিন বা ১৫ দিনের বাজেট ট্র্যাকিং' : 'Define custom cycles independent of calendar months'}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors self-start sm:self-auto shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{language === 'bn' ? 'নতুন পিরিয়ড' : 'New Period'}</span>
        </button>
      </div>

      {/* Tracking Period List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trackingPeriods.map((period) => {
          const spent = getPeriodSpent(period);
          const target = period.spending_target || 0;
          const percentage = target > 0 ? Math.min(100, Math.round((spent / target) * 100)) : 0;
          const isOver = target > 0 && spent > target;
          const isActive = period.is_active && period.status === 'active';

          return (
            <div
              key={period.id}
              className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between shadow-xs ${
                isActive
                  ? 'border-emerald-500 shadow-md shadow-emerald-600/10 ring-1 ring-emerald-500/30'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{period.name}</h3>
                    {isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ACTIVE
                      </span>
                    ) : period.status === 'closed' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                        CLOSED
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(period)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(period)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CalendarRange className="w-3.5 h-3.5 text-emerald-600" />
                    {period.start_date} {period.end_date ? `to ${period.end_date}` : '(No end date)'}
                  </span>
                  {target > 0 && (
                    <span className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-emerald-600" />
                      Target: {formatCurrency(target, currency, false)}
                    </span>
                  )}
                </div>

                {period.notes && (
                  <p className="text-xs text-slate-500 mt-2 italic">
                    "{period.notes}"
                  </p>
                )}

                {/* Progress bar */}
                {target > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">
                        Spent: <strong className="text-slate-900 tnum">{formatCurrency(spent, currency)}</strong>
                      </span>
                      <span className={isOver ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                        {percentage}% {isOver && '(Over budget)'}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver ? 'bg-rose-500' : percentage > 85 ? 'bg-amber-400' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {!isActive ? (
                  <button
                    onClick={() => setActivePeriod(period.id)}
                    className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Set as Active Period
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Currently Tracking
                  </span>
                )}

                {period.status === 'active' ? (
                  <button
                    onClick={() => closeTrackingPeriod(period.id)}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Close Period
                  </button>
                ) : (
                  <button
                    onClick={() => reopenTrackingPeriod(period.id)}
                    className="text-xs text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reopen Period
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Period Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPeriod ? 'Edit Tracking Period' : 'New Tracking Period'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Period Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nov 9 - Nov 15 Weekly Track"
              required
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">End Date (Optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Spending Target ({currency})
            </label>
            <input
              type="number"
              value={spendingTarget}
              onChange={(e) => setSpendingTarget(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Add any reminders for this cycle..."
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="makeActive"
              checked={makeActive}
              onChange={(e) => setMakeActive(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="makeActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Set as the currently active tracking cycle
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            {editingPeriod ? 'Update Period' : 'Create Tracking Period'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
