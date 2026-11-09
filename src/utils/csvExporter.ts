import Papa from 'papaparse';
import { Transaction } from '@/types';

/**
 * Exports transactions to CSV and triggers browser download
 */
export function exportTransactionsToCSV(transactions: Transaction[], filename = 'DailySpend_Transactions.csv'): void {
  const data = transactions.map(t => ({
    ID: t.id,
    Date: t.date,
    Time: t.time,
    Type: t.type.toUpperCase(),
    Amount: t.amount,
    Category: t.category_name || '',
    Wallet: t.wallet_name || '',
    'Destination Wallet': t.to_wallet_name || '',
    Description: t.description,
    PaymentMethod: t.payment_method || '',
    Notes: t.notes || '',
    IsReviewed: t.is_reviewed ? 'YES' : 'NO',
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses uploaded CSV file
 */
export function parseCSVFile(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as Record<string, unknown>[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

