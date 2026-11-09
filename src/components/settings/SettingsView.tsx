import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Download,
  Upload,
  LogOut,
  RefreshCw,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/db/supabase';

export const SettingsView: React.FC = () => {
  const { user, updateProfile, signOut } = useAuth();
  const { exportBackupJSON, restoreBackupJSON, refreshData } = useFinance();
  const { language, setLanguage } = useLanguage();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [currencySymbol, setCurrencySymbol] = useState(user?.currency_symbol || '৳');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(user?.time_format || '12h');
  const [isSaved, setIsSaved] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      full_name: fullName,
      currency_symbol: currencySymbol,
      time_format: timeFormat,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExportJSON = async () => {
    const jsonStr = await exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DailySpend_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(language === 'bn' ? 'ব্যাকআপ ফাইলটি রিস্টোর করতে চান?' : 'Restore backup file?')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await restoreBackupJSON(content);
      if (success) {
        setRestoreStatus(language === 'bn' ? 'সফলভাবে রিস্টোর হয়েছে!' : 'Backup restored successfully!');
      } else {
        setRestoreStatus(language === 'bn' ? 'ফাইলটি সঠিক নয়।' : 'Failed to restore. Invalid file.');
      }
      setTimeout(() => setRestoreStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {language === 'bn' ? 'সেটিংস ও প্রোফাইল' : 'Settings & Profile'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'bn' ? 'প্রোফাইল, ভাষা, মুদ্রা ও অফলাইন ব্যাকআপ সংক্রান্ত সেটিংস' : 'Manage your preferences, currency, and data backups'}
        </p>
      </div>

      {/* Cloud & Local Status */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isSupabaseConfigured
                ? (language === 'bn' ? 'সুপাবেস ক্লাউড কানেক্টেড' : 'Supabase Cloud Connected')
                : (language === 'bn' ? 'অফলাইন সুরক্ষিত স্টোরেজ (IndexedDB)' : 'Local Offline Storage (IndexedDB)')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSupabaseConfigured
                ? 'Multi-device cloud synchronization active'
                : (language === 'bn' ? 'ইন্টারনেট ছাড়াই স্বয়ংক্রিয়ভাবে ব্রাউজারে সুরক্ষিত' : 'Data safely stored in your browser')}
            </p>
          </div>
        </div>

        <button
          onClick={() => refreshData()}
          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Profile & Currency Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          {language === 'bn' ? 'ব্যক্তিগত তথ্য ও ভাষা' : 'Profile & Language'}
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            {language === 'bn' ? 'আপনার নাম' : 'Full Name'}
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              {language === 'bn' ? 'মুদ্রা প্রতীক' : 'Currency Symbol'}
            </label>
            <select
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 outline-none font-bold"
            >
              <option value="৳">৳ (BDT)</option>
              <option value="$">$ (USD)</option>
              <option value="€">€ (EUR)</option>
              <option value="£">£ (GBP)</option>
              <option value="₹">₹ (INR)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              {language === 'bn' ? 'অ্যাপ্লিকেশন ভাষা' : 'Language'}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 outline-none font-medium"
            >
              <option value="bn">বাংলা (Google Sans Bengali)</option>
              <option value="en">English (Google Sans)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : null}
          <span>{isSaved ? (language === 'bn' ? 'সংরক্ষিত হয়েছে' : 'Saved') : (language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')}</span>
        </button>
      </form>

      {/* Backup and Restore */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-3 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          {language === 'bn' ? 'ডাটা ব্যাকআপ ও রিস্টোর' : 'Backup & Data Restoration'}
        </h2>
        <p className="text-xs text-slate-500">
          {language === 'bn'
            ? 'আপনার সকল আর্থিক রেকর্ডের একটি ব্যাকআপ ফাইল সংরক্ষণ করুন বা পূর্বের ব্যাকআপ ফাইল থেকে পুনরুদ্ধার করুন।'
            : 'Download a JSON file of all your financial records or restore from a previous backup.'}
        </p>

        {restoreStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            {restoreStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'bn' ? 'জেসন ব্যাকআপ ডাউনলোড' : 'Download JSON Backup'}</span>
          </button>

          <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-dashed border-slate-300 hover:border-emerald-500 text-slate-600 hover:text-slate-900 font-bold text-xs transition-colors cursor-pointer bg-slate-50">
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'bn' ? 'ফাইল থেকে রিস্টোর' : 'Restore from File'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Sign Out */}
      <div className="pt-2 text-center">
        <button
          onClick={() => signOut()}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'লগআউট করুন' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );
};
