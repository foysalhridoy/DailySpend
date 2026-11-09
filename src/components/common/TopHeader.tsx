import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { SyncStatus, TrackingPeriod } from '@/types';
import { Languages, Bell, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface TopHeaderProps {
  syncStatus: SyncStatus;
  activePeriod: TrackingPeriod | null;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ syncStatus }) => {
  const { user } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3 no-print transition-colors">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        {/* Left: Circular navigation button or Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => (!isHome ? navigate(-1) : navigate('/transactions'))}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shadow-2xs"
            title={!isHome ? 'Go Back' : 'View Transactions'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span>DailySpend</span>
              {syncStatus === 'synced' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Cloud Synced" />
              )}
            </h1>
          </div>
        </div>

        {/* Right: Language, Notification Bell, and Profile Avatar */}
        <div className="flex items-center gap-2.5">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
            title="Switch Language"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'bn' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Notification Bell with indicator */}
          <button
            onClick={() => navigate('/timeline')}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 relative cursor-pointer"
            title="Notifications & Activity"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          {/* Profile Avatar with online green dot */}
          <button
            onClick={() => navigate('/settings')}
            className="relative w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 border border-emerald-700/20 flex items-center justify-center text-xs font-bold text-white transition-all overflow-visible cursor-pointer shadow-xs"
            title={user?.full_name || 'Profile'}
          >
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-extrabold text-white">
                  {user?.full_name?.charAt(0).toUpperCase() || 'H'}
                </span>
              )}
            </div>
            {/* Online green indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>
        </div>
      </div>
    </header>
  );
};
