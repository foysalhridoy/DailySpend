import React from 'react';
import { SyncStatus } from '@/types';
import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SyncBadgeProps {
  status: SyncStatus;
  onClick?: () => void;
}

export const SyncBadge: React.FC<SyncBadgeProps> = ({ status, onClick }) => {
  const { language } = useLanguage();

  const getBadgeConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: Cloud,
          label: language === 'bn' ? 'সংযুক্ত' : 'Synced',
          classes: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-emerald-500',
        };
      case 'syncing':
        return {
          icon: RefreshCw,
          label: language === 'bn' ? 'সিঙ্ক হচ্ছে' : 'Syncing',
          classes: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-blue-500 animate-spin',
        };
      case 'offline':
        return {
          icon: CloudOff,
          label: language === 'bn' ? 'অফলাইন' : 'Offline',
          classes: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-amber-500',
        };
      case 'failed':
      default:
        return {
          icon: AlertCircle,
          label: language === 'bn' ? 'ব্যর্থ' : 'Failed',
          classes: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${config.classes}`}
      title={`Cloud status: ${config.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3 h-3 text-slate-500" />
      <span className="hidden sm:inline">{config.label}</span>
    </button>
  );
};
