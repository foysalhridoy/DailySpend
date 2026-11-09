import { jsPDF } from 'jspdf';
import { ReceiptData, ReceiptFormat, FinancialStats } from '@/types';
import { formatCurrency } from './formatters';

/**
 * Generates a realistic thermal receipt PDF (58mm, 80mm) or A4 statement
 * with accurate dynamic height and line wrapping to prevent any clipping.
 */
export function generateReceiptPDF(data: ReceiptData, format: ReceiptFormat = '58mm'): jsPDF {
  let doc: jsPDF;

  if (format === '58mm') {
    // 58mm roll width. Printable content width: 48mm. Margins: 5mm left, 5mm right.
    const maxDescWidth = 28; // mm for description column (leaves 18mm for amount on the right)
    
    // First pass: Pre-calculate wrapped lines for every item to determine exact dynamic document height
    const tempDoc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [58, 200] });
    tempDoc.setFont('courier', 'normal');
    tempDoc.setFontSize(7.5);

    let totalItemsHeight = 0;
    const processedItems: { lines: string[]; amountStr: string }[] = [];

    for (const item of data.items) {
      const lines = tempDoc.splitTextToSize(item.description, maxDescWidth) as string[];
      const amountStr = `${data.currency} ${item.amount.toFixed(2)}`;
      processedItems.push({ lines, amountStr });
      totalItemsHeight += Math.max(lines.length * 3.8, 4.5);
    }

    const headerHeight = 35;
    const totalsHeight = 35;
    const footerHeight = 25;
    const calculatedHeight = Math.max(90, headerHeight + totalItemsHeight + totalsHeight + footerHeight);

    // Create the properly dimensioned receipt document
    doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [58, calculatedHeight],
    });

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text('DAILYSPEND', 29, 8, { align: 'center' });

    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.text('PERSONAL FINANCE & EXPENSE', 29, 12, { align: 'center' });
    doc.text('--------------------------------', 29, 15, { align: 'center' });

    doc.text(`RC: ${data.receiptNumber}`, 4, 19);
    doc.text(`Date: ${data.date} ${data.time}`, 4, 23);
    if (data.userName) doc.text(`User: ${data.userName}`, 4, 27);
    if (data.trackingPeriodName) doc.text(`Period: ${data.trackingPeriodName}`, 4, 31);
    
    const metaBottomY = data.trackingPeriodName ? 34 : 30;
    doc.text('--------------------------------', 29, metaBottomY, { align: 'center' });

    let y = metaBottomY + 4;
    for (const item of processedItems) {
      // Print wrapped description lines
      for (let i = 0; i < item.lines.length; i++) {
        doc.text(item.lines[i], 4, y + (i * 3.6));
      }
      // Print amount aligned to right (at 54mm)
      doc.text(item.amountStr, 54, y, { align: 'right' });
      y += Math.max(item.lines.length * 3.8, 4.5);
    }

    doc.text('--------------------------------', 29, y, { align: 'center' });
    y += 4;

    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    if (data.totalExpense > 0) {
      doc.text('TOTAL EXPENSE:', 4, y);
      doc.text(`${data.currency} ${data.totalExpense.toFixed(2)}`, 54, y, { align: 'right' });
      y += 5;
    }
    if (data.totalIncome > 0) {
      doc.text('TOTAL INCOME:', 4, y);
      doc.text(`+${data.currency} ${data.totalIncome.toFixed(2)}`, 54, y, { align: 'right' });
      y += 5;
    }

    if (data.closingBalance !== undefined) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(7);
      doc.text(`Closing Bal:`, 4, y);
      doc.text(`${data.currency} ${data.closingBalance.toFixed(2)}`, 54, y, { align: 'right' });
      y += 5;
    }

    y += 2;
    doc.setFontSize(6.5);
    doc.text('Thank you for tracking!', 29, y, { align: 'center' });
    y += 3.5;
    doc.text('*** END OF RECEIPT ***', 29, y, { align: 'center' });

  } else if (format === '80mm') {
    // 80mm roll width. Printable content width: 72mm. Margins: 4mm left, 4mm right.
    const maxDescWidth = 44; // mm for description column (leaves 24mm for amount on the right)
    
    // Pre-calculate wrapped lines for dynamic height
    const tempDoc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 250] });
    tempDoc.setFont('courier', 'normal');
    tempDoc.setFontSize(8.5);

    let totalItemsHeight = 0;
    const processedItems: { lines: string[]; amountStr: string }[] = [];

    for (const item of data.items) {
      const lines = tempDoc.splitTextToSize(item.description, maxDescWidth) as string[];
      const amountStr = `${data.currency} ${item.amount.toFixed(2)}`;
      processedItems.push({ lines, amountStr });
      totalItemsHeight += Math.max(lines.length * 4.2, 5.5);
    }

    const headerHeight = 45;
    const totalsHeight = 40;
    const footerHeight = 25;
    const calculatedHeight = Math.max(110, headerHeight + totalItemsHeight + totalsHeight + footerHeight);

    doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, calculatedHeight],
    });

    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.text('DAILYSPEND', 40, 10, { align: 'center' });

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.text('PERSONAL FINANCE & EXPENSE MANAGER', 40, 15, { align: 'center' });
    doc.text('========================================', 40, 19, { align: 'center' });

    doc.text(`Receipt #: ${data.receiptNumber}`, 5, 24);
    doc.text(`Date/Time: ${data.date}  ${data.time}`, 5, 29);
    if (data.userName) doc.text(`Account: ${data.userName}`, 5, 34);
    if (data.trackingPeriodName) doc.text(`Period: ${data.trackingPeriodName}`, 5, 39);

    const metaBottomY = data.trackingPeriodName ? 43 : 38;
    doc.text('----------------------------------------', 40, metaBottomY, { align: 'center' });

    let y = metaBottomY + 5;
    for (const item of processedItems) {
      for (let i = 0; i < item.lines.length; i++) {
        doc.text(item.lines[i], 5, y + (i * 4.0));
      }
      doc.text(item.amountStr, 75, y, { align: 'right' });
      y += Math.max(item.lines.length * 4.2, 5.5);
    }

    doc.text('----------------------------------------', 40, y, { align: 'center' });
    y += 5;

    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    if (data.totalExpense > 0) {
      doc.text('TOTAL EXPENSE:', 5, y);
      doc.text(`${data.currency} ${data.totalExpense.toFixed(2)}`, 75, y, { align: 'right' });
      y += 6;
    }
    if (data.totalIncome > 0) {
      doc.text('TOTAL INCOME:', 5, y);
      doc.text(`+${data.currency} ${data.totalIncome.toFixed(2)}`, 75, y, { align: 'right' });
      y += 6;
    }

    if (data.closingBalance !== undefined) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.text(`Closing Balance:`, 5, y);
      doc.text(`${data.currency} ${data.closingBalance.toFixed(2)}`, 75, y, { align: 'right' });
      y += 6;
    }

    y += 3;
    doc.setFontSize(7.5);
    doc.text('Verified Personal Finance Ledger', 40, y, { align: 'center' });
    y += 4;
    doc.text('*** KEEP FOR YOUR RECORDS ***', 40, y, { align: 'center' });

  } else {
    // A4 Standard Document
    doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text('DailySpend Financial Statement', 20, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Receipt No: ${data.receiptNumber}`, 20, 32);

    doc.setDrawColor(226, 232, 240);
    doc.line(20, 36, 190, 36);

    let y = 46;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text('Item Description', 20, y);
    doc.text('Category', 90, y);
    doc.text('Wallet', 130, y);
    doc.text('Amount', 190, y, { align: 'right' });

    y += 4;
    doc.line(20, y, 190, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);

    for (const item of data.items) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(item.description, 20, y);
      doc.text(item.category || '-', 90, y);
      doc.text(item.wallet || '-', 130, y);
      doc.text(`${data.currency} ${item.amount.toFixed(2)}`, 190, y, { align: 'right' });
      y += 8;
    }

    y += 4;
    doc.line(20, y, 190, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Total Expense: ${data.currency} ${data.totalExpense.toFixed(2)}`, 190, y, { align: 'right' });
  }

  return doc;
}

/**
 * Generates Full Financial Analytics Report PDF
 */
export function generateAnalyticsReportPDF(
  stats: FinancialStats,
  currency = '৳',
  periodName = 'Active Tracking Period'
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('DailySpend Analytics & Summary', 20, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Period: ${periodName} | Exported: ${new Date().toLocaleDateString()}`, 20, 32);

  doc.setDrawColor(226, 232, 240);
  doc.line(20, 36, 190, 36);

  // Financial Cards Grid
  let y = 48;
  const metrics = [
    { title: 'Available Balance', value: formatCurrency(stats.availableBalance, currency) },
    { title: 'Total Opening Balance', value: formatCurrency(stats.totalOpeningBalance, currency) },
    { title: 'Period Total Income', value: formatCurrency(stats.periodIncome, currency) },
    { title: 'Period Total Expense', value: formatCurrency(stats.periodExpense, currency) },
    { title: 'Net Cash Flow', value: formatCurrency(stats.netCashFlow, currency) },
    { title: 'Average Daily Spend', value: formatCurrency(stats.averageDailyExpense, currency) },
  ];

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);

  for (let i = 0; i < metrics.length; i += 2) {
    const m1 = metrics[i];
    const m2 = metrics[i + 1];

    doc.setFont('helvetica', 'bold');
    doc.text(m1.title, 20, y);
    if (m2) doc.text(m2.title, 110, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(m1.value, 20, y + 6);
    if (m2) doc.text(m2.value, 110, y + 6);

    y += 18;
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
  }

  y += 10;
  doc.line(20, y, 190, y);
  y += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Key Highlights:', 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  if (stats.topCategory) {
    doc.text(`• Top Spending Category: ${stats.topCategory.name} (${formatCurrency(stats.topCategory.amount, currency)}, ${stats.topCategory.percentage}%)`, 20, y);
    y += 7;
  }
  if (stats.highestSpendingDay) {
    doc.text(`• Peak Spending Day: ${stats.highestSpendingDay.date} (${formatCurrency(stats.highestSpendingDay.amount, currency)})`, 20, y);
    y += 7;
  }
  if (stats.remainingBudget !== null) {
    doc.text(`• Budget Status: ${formatCurrency(stats.remainingBudget, currency)} remaining`, 20, y);
    y += 7;
  }

  return doc;
}
