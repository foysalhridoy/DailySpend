import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  amount: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'rose' | 'indigo' | 'amber' | 'slate';
  subtext?: string;
  badge?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  icon: Icon,
  variant = 'slate',
  subtext,
  badge,
  onClick,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
          border: 'border-emerald-200/60 dark:border-emerald-900/30',
          gradient: 'from-emerald-500/5 to-transparent',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
          border: 'border-rose-200/60 dark:border-rose-900/30',
          gradient: 'from-rose-500/5 to-transparent',
        };
      case 'indigo':
        return {
          iconBg: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
          border: 'border-indigo-200/60 dark:border-indigo-900/30',
          gradient: 'from-indigo-500/5 to-transparent',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
          border: 'border-amber-200/60 dark:border-amber-900/30',
          gradient: 'from-amber-500/5 to-transparent',
        };
      case 'slate':
      default:
        return {
          iconBg: 'bg-slate-500/10 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300',
          border: 'border-slate-200 dark:border-slate-800',
          gradient: 'from-slate-500/5 to-transparent',
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 p-4 sm:p-5 border ${vStyles.border} shadow-sm backdrop-blur-sm ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      }`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${vStyles.gradient} rounded-full blur-xl pointer-events-none`} />

      <div className="flex items-start justify-between">
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <div className={`p-2 sm:p-2.5 rounded-xl ${vStyles.iconBg}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      <div className="mt-2.5 sm:mt-3">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white tnum">
          {amount}
        </h3>
        {(subtext || badge) && (
          <div className="mt-1.5 flex items-center gap-1.5">
            {badge && (
              <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {badge}
              </span>
            )}
            {subtext && (
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {subtext}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

