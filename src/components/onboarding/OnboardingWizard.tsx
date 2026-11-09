import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { WalletType } from '@/types';
import { getTodayDateString } from '@/utils/calculations';
import { Sparkles, ArrowRight, Check, ShieldCheck, Wallet, Calendar } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { user, completeOnboarding, updateProfile } = useAuth();
  const { addWallet, addTrackingPeriod, refreshData } = useFinance();

  const [step, setStep] = useState<number>(1);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [currencySymbol, setCurrencySymbol] = useState(user?.currency_symbol || '৳');

  // Wallet Setup
  const [walletName, setWalletName] = useState('Cash');
  const [walletType, setWalletType] = useState<WalletType>('cash');
  const [openingBalance, setOpeningBalance] = useState('5000');

  // Tracking Period Setup
  const [enablePeriod, setEnablePeriod] = useState(true);
  const [periodName, setPeriodName] = useState('Weekly Cycle');
  const [spendingTarget, setSpendingTarget] = useState('8000');

  const handleNext = async () => {
    if (step === 2) {
      await updateProfile({
        full_name: fullName,
        currency_symbol: currencySymbol,
      });
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      const ob = parseFloat(openingBalance) || 0;
      await addWallet({
        name: walletName,
        type: walletType,
        opening_balance: ob,
        color: '#10b981',
        icon: 'wallet',
        is_default: true,
      });
      setStep(5);
    } else if (step === 5) {
      if (enablePeriod) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        await addTrackingPeriod({
          name: periodName,
          start_date: getTodayDateString(),
          end_date: nextWeek.toISOString().split('T')[0],
          spending_target: parseFloat(spendingTarget) || undefined,
          is_active: true,
          status: 'active',
          notes: 'Configured during initial onboarding',
        });
      }
      setStep(6);
    } else if (step === 6) {
      await completeOnboarding();
      await refreshData();
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-6 bg-emerald-500'
                  : i < step
                  ? 'w-2 bg-emerald-500/50'
                  : 'w-2 bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-emerald-500/20">
              ৳
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Welcome to DailySpend</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
                Your premium personal finance, multi-wallet ledger, and thermal receipt companion.
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Personal Preferences */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
              <p className="text-xs text-slate-500">What should we call you and which currency do you use?</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Your Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Hridoy"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Currency</label>
                <select
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-semibold"
                >
                  <option value="৳">৳ BDT (Bangladeshi Taka)</option>
                  <option value="$">$ USD (US Dollar)</option>
                  <option value="€">€ EUR (Euro)</option>
                  <option value="£">£ GBP (British Pound)</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 3: Initial Wallet */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Primary Wallet</h3>
              <p className="text-xs text-slate-500">Select where you keep money day-to-day</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Cash', type: 'cash' },
                { name: 'bKash', type: 'bkash' },
                { name: 'Nagad', type: 'nagad' },
                { name: 'Bank', type: 'bank' },
              ].map((w) => (
                <button
                  key={w.name}
                  type="button"
                  onClick={() => {
                    setWalletName(w.name);
                    setWalletType(w.type as WalletType);
                  }}
                  className={`p-3 rounded-2xl border text-left font-bold text-xs transition-all ${
                    walletName === w.name
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 4: Opening Balance */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Opening Capital</h3>
              <p className="text-xs text-slate-500">
                Current balance in your {walletName} wallet (never counted as income).
              </p>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                {currencySymbol}
              </span>
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="5000"
                className="w-full pl-11 pr-4 py-3 text-2xl font-bold rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white tnum"
              />
            </div>
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 5: Optional Tracking Period */}
        {step === 5 && (
          <div className="space-y-4 py-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Flexible Tracking Period</h3>
              <p className="text-xs text-slate-500">
                Optionally set a target for this week or custom cycle.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enablePeriod}
                onChange={(e) => setEnablePeriod(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Create a 7-day tracking period now
              </span>
            </label>
            {enablePeriod && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Period Name</label>
                  <input
                    type="text"
                    value={periodName}
                    onChange={(e) => setPeriodName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Spending Target</label>
                  <input
                    type="number"
                    value={spendingTarget}
                    onChange={(e) => setSpendingTarget(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white tnum"
                  />
                </div>
              </div>
            )}
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md"
            >
              {enablePeriod ? 'Save Period & Finish' : 'Skip & Finish'}
            </button>
          </div>
        )}

        {/* Step 6: Complete */}
        {step === 6 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">You're All Set!</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Your wallet is configured with reconciled balances. You're ready to track with 5-second quick entries.
              </p>
            </div>
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md"
            >
              Open DailySpend Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

