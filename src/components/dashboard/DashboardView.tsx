import React from 'react';
import { CleanDashboard } from './CleanDashboard';
import { Transaction } from '@/types';

interface DashboardViewProps {
  onQuickAdd: () => void;
  onOpenTransfer: () => void;
  onAddWallet: () => void;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onQuickAdd,
  onOpenTransfer,
  onSelectTransaction,
}) => {
  return (
    <CleanDashboard
      onQuickAdd={onQuickAdd}
      onOpenTransfer={onOpenTransfer}
      onSelectTransaction={onSelectTransaction}
    />
  );
};
