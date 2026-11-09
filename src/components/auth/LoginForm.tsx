import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onForgotPassword,
}) => {
  const { login } = useAuth();
  const { language } = useLanguage();
  const [email, setEmail] = useState('hridoy@dailyspend.app');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    if (res.error) {
      setError(res.error);
    }
    setLoading(false);
  };

  const handleDemoGuestLogin = async () => {
    setLoading(true);
    await login('demo@dailyspend.app', 'demo1234');
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xl space-y-5 text-slate-900">
      {/* Brand Header */}
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center text-emerald-600 text-xl font-bold shadow-xs">
          ৳
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">DailySpend</h1>
        <p className="text-xs text-slate-500">
          {language === 'bn' ? 'সাইন ইন করে আপনার ব্যক্তিগত ফাইন্যান্স পরিচালনা করুন' : 'Sign in to access your finances'}
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
            {language === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-600">
              {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[11px] font-semibold text-emerald-600 hover:underline cursor-pointer"
            >
              {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
            </button>
          </div>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Signing in...') : (language === 'bn' ? 'সাইন ইন করুন' : 'Sign In')}
        </button>

        <button
          type="button"
          onClick={handleDemoGuestLogin}
          disabled={loading}
          className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
        >
          {language === 'bn' ? 'গেস্ট ডেমো দিয়ে প্রবেশ করুন' : 'Instant Demo Sign-in'}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          {language === 'bn' ? 'অ্যাকাউন্ট নেই? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-emerald-600 font-bold hover:underline cursor-pointer"
          >
            {language === 'bn' ? 'রেজিস্ট্রেশন করুন' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};
