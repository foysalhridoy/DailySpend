import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';

// Components
import { DesktopSidebar } from '@/components/common/DesktopSidebar';
import { BottomNav } from '@/components/common/BottomNav';
import { TopHeader } from '@/components/common/TopHeader';
import { QuickExpenseModal } from '@/components/dashboard/QuickExpenseModal';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { WalletTransferModal } from '@/components/wallets/WalletTransferModal';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

// Views
import { DashboardView } from '@/components/dashboard/DashboardView';
import { DailyTimeline } from '@/components/timeline/DailyTimeline';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TrackingPeriodManager } from '@/components/tracking/TrackingPeriodManager';
import { WalletManager } from '@/components/wallets/WalletManager';
import { BudgetManager } from '@/components/budgets/BudgetManager';
import { ReceiptStudio } from '@/components/receipts/ReceiptStudio';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { DailyClosingView } from '@/components/dailyclosing/DailyClosingModal';
import { SettingsView } from '@/components/settings/SettingsView';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { Transaction } from '@/types';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const { syncStatus, activePeriod } = useFinance();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isFullAddOpen, setIsFullAddOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 text-xl font-black animate-pulse shadow-md">
            ৳
          </div>
          <p className="text-xs font-semibold text-slate-500">DailySpend লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show clean Auth screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F9FA] text-slate-900">
        {authView === 'login' ? (
          <LoginForm
            onSwitchToRegister={() => setAuthView('register')}
            onForgotPassword={() => setIsForgotOpen(true)}
          />
        ) : (
          <RegisterForm onSwitchToLogin={() => setAuthView('login')} />
        )}
        <ForgotPasswordModal
          isOpen={isForgotOpen}
          onClose={() => setIsForgotOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#0F172A] selection:bg-emerald-500 selection:text-white">
      {/* Onboarding Wizard (if user is_onboarded is false) */}
      {!user.is_onboarded && (
        <OnboardingWizard onComplete={() => {}} />
      )}

      {/* Desktop Sidebar (hidden on mobile) */}
      <DesktopSidebar
        syncStatus={syncStatus}
        onQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader syncStatus={syncStatus} activePeriod={activePeriod} />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto pb-28 md:pb-8">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardView
                  onQuickAdd={() => setIsQuickAddOpen(true)}
                  onOpenTransfer={() => setIsTransferOpen(true)}
                  onAddWallet={() => setIsAddWalletOpen(true)}
                  onSelectTransaction={(tx) => setSelectedTx(tx)}
                />
              }
            />
            <Route
              path="/timeline"
              element={
                <DailyTimeline
                  onSelectTransaction={(tx) => setSelectedTx(tx)}
                />
              }
            />
            <Route
              path="/transactions"
              element={
                <TransactionList
                  onEditTransaction={(tx) => setSelectedTx(tx)}
                />
              }
            />
            <Route path="/periods" element={<TrackingPeriodManager />} />
            <Route path="/wallets" element={<WalletManager />} />
            <Route path="/budgets" element={<BudgetManager />} />
            <Route path="/receipts" element={<ReceiptStudio />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/closing" element={<DailyClosingView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation with Floating Quick Add Action */}
      <BottomNav onQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Global Modals */}
      <QuickExpenseModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      <AddTransactionModal
        isOpen={isFullAddOpen}
        onClose={() => setIsFullAddOpen(false)}
      />

      <WalletTransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <FinanceProvider>
              <MainLayout />
            </FinanceProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
