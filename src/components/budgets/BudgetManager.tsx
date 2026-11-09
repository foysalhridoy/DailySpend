import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Budget, BudgetPeriodType } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { PieChart, Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { DEFAULT_EXPENSE_CATEGORIES } from '@/utils/constants';

export const BudgetManager: React.FC = () => {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget, activePeriod } = useFinance();
  const { user } = useAuth();
  const { language } = useLanguage();
  const currency = user?.currency_symbol || '৳';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [periodType, setPeriodType] = useState<BudgetPeriodType>('monthly');
  const [categoryName, setCategoryName] = useState<string>('');

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setName('Food & Dining');
    setAmount('5000');
    setPeriodType('monthly');
    setCategoryName('Lunch');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Budget) => {
    setEditingBudget(b);
    setName(b.name);
    setAmount(b.amount.toString());
    setPeriodType(b.period_type);
    setCategoryName(b.category_name || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;

    if (editingBudget) {
      await updateBudget(editingBudget.id, {
        name,
        amount: amt,
        period_type: periodType,
        category_name: categoryName || undefined,
      });
    } else {
      await addBudget({
        name,
        amount: amt,
        period_type: periodType,
        category_name: categoryName || undefined,
        tracking_period_id: activePeriod?.id,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(language === 'bn' ? 'এই বাজেটটি মুছে ফেলতে চান?' : 'Delete this budget?')) {
      await deleteBudget(id);
    }
  };

  const getBudgetSpent = (b: Budget) => {
    return transactions
      .filter(t => t.type === 'expense')
      .filter(t => !b.category_name || t.category_name === b.category_name)
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {language === 'bn' ? 'বাজেট পরিকল্পনা' : 'Budget Targets'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn' ? 'ক্যাটাগরি বা সময়ভিত্তিক ব্যয়ের সীমা ও রিয়েলটাইম অ্যালার্ট' : 'Set spending targets per category, day, week, or month'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors self-start sm:self-auto shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{language === 'bn' ? 'নতুন বাজেট' : 'New Budget'}</span>
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs">
          <PieChart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">
            {language === 'bn' ? 'কোনো বাজেট তৈরি করা হয়নি' : 'No Budgets Configured'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {language === 'bn' ? 'আপনি যেকোনো সময় নির্দিষ্ট ক্যাটাগরির জন্য ব্যয়ের বাজেট নির্ধারণ করতে পারেন।' : 'Create category or period-specific spending targets anytime.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            {language === 'bn' ? 'প্রথম বাজেট যোগ করুন' : 'Create Your First Budget'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const spent = getBudgetSpent(b);
            const remaining = b.amount - spent;
            const percentage = Math.min(100, Math.round((spent / b.amount) * 100));
            const isExceeded = spent > b.amount;
            const isWarning = percentage >= 80 && !isExceeded;

            return (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="capitalize">{b.period_type} Target</span>
                        {b.category_name && <span>• {b.category_name}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Warning / Alert Banner */}
                  {isExceeded ? (
                    <div className="my-2.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{language === 'bn' ? 'বাজেট অতিরিক্ত ব্যয়: ' : 'Budget exceeded by '} {formatCurrency(Math.abs(remaining), currency)}</span>
                    </div>
                  ) : isWarning ? (
                    <div className="my-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{percentage}% {language === 'bn' ? 'বাজেট ব্যয়িত হয়েছে' : 'of budget spent'}</span>
                    </div>
                  ) : null}

                  {/* Numbers */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400">{language === 'bn' ? 'বাজেট' : 'Budget'}</span>
                      <p className="font-bold text-slate-900 tnum mt-0.5">
                        {formatCurrency(b.amount, currency, false)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">{language === 'bn' ? 'ব্যয়' : 'Spent'}</span>
                      <p className="font-bold text-rose-600 tnum mt-0.5">
                        {formatCurrency(spent, currency, false)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">{language === 'bn' ? 'অবশিষ্ট' : 'Remaining'}</span>
                      <p
                        className={`font-bold tnum mt-0.5 ${
                          remaining < 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {formatCurrency(remaining, currency, false)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3.5">
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? (language === 'bn' ? 'বাজেট পরিবর্তন' : 'Edit Budget') : (language === 'bn' ? 'নতুন বাজেট নির্ধারণ' : 'Create Budget')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {language === 'bn' ? 'বাজেটের নাম' : 'Budget Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monthly Grocery or Weekend Treat"
              required
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {language === 'bn' ? 'বাজেটের পরিমাণ' : 'Budget Limit'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-600">
                {currency}
              </span>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
                required
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 outline-none tnum"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                {language === 'bn' ? 'সময়কাল' : 'Period Cycle'}
              </label>
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as BudgetPeriodType)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="period">Active Period</option>
                <option value="category">Category-Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                {language === 'bn' ? 'ক্যাটাগরি' : 'Category (Optional)'}
              </label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
              >
                <option value="">{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
                {DEFAULT_EXPENSE_CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              {editingBudget ? (language === 'bn' ? 'আপডেট করুন' : 'Update Budget') : (language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Budget')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
