import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { signUp } = useAuth();
  const { language } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(language === 'bn' ? 'পাসওয়ার্ড দুটি মিলছে না' : 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const res = await signUp(email, password, fullName);
    if (res.error) {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xl space-y-5 text-slate-900">
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center text-emerald-600 text-xl font-bold shadow-xs">
          ৳
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          {language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}
        </h1>
        <p className="text-xs text-slate-500">
          {language === 'bn' ? 'DailySpend-এ আপনার আর্থিক হিসাব রাখুন' : 'Sign up for DailySpend'}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            {language === 'bn' ? 'আপনার নাম' : 'Full Name'}
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Hridoy Khan"
              required
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            {language === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-600 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (language === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating...') : (language === 'bn' ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'Complete Registration')}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          {language === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-emerald-600 font-bold hover:underline cursor-pointer"
          >
            {language === 'bn' ? 'সাইন ইন করুন' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};
