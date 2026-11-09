import React from 'react';
import { ReceiptData, ReceiptFormat } from '@/types';
import { Printer, Download } from 'lucide-react';
import { generateReceiptPDF } from '@/utils/pdfGenerator';

interface ThermalReceiptViewProps {
  data: ReceiptData;
  format: ReceiptFormat;
}

export const ThermalReceiptView: React.FC<ThermalReceiptViewProps> = ({ data, format }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = generateReceiptPDF(data, format);
    doc.save(`DailySpend_${data.receiptNumber}.pdf`);
  };

  // Screen preview width classes
  const getScreenContainerClass = () => {
    switch (format) {
      case '58mm':
        return 'w-[300px] text-[11px]';
      case '80mm':
        return 'w-[390px] text-xs';
      case 'a4':
      default:
        return 'w-full max-w-2xl text-sm';
    }
  };

  const getFormatReceiptClass = () => {
    switch (format) {
      case '58mm':
        return 'receipt-58mm';
      case '80mm':
        return 'receipt-80mm';
      case 'a4':
      default:
        return 'receipt-a4';
    }
  };

  return (
    <div className="flex flex-col items-center w-full printable-receipt-wrapper">
      {/* Control Action Buttons (Hidden during Print) */}
      <div className="flex items-center gap-2 mb-4 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          title="Print receipt or Save as PDF"
        >
          <Printer className="w-4 h-4" />
          <span>Print Receipt</span>
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
          title="Download vector PDF"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Realistic Receipt Paper Canvas */}
      <div
        className={`${getScreenContainerClass()} printable-receipt ${getFormatReceiptClass()} bg-white text-slate-900 p-5 sm:p-6 rounded-t-sm shadow-xl border border-slate-200 select-text transition-all`}
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          color: '#111827',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Header Block */}
        <div className="receipt-header text-center pb-3 border-b border-dashed border-slate-400">
          <h2 className="text-base sm:text-lg font-black tracking-widest uppercase">DAILYSPEND</h2>
          <p className="text-[10px] tracking-wide text-slate-600 font-semibold">PERSONAL FINANCE & EXPENSE</p>
          <p className="text-[9px] text-slate-500">Dhaka, Bangladesh • Cloud Verified</p>
        </div>

        {/* Receipt Meta Block */}
        <div className="receipt-meta py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">RC NO:</span>
            <span className="font-bold">{data.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">DATE/TIME:</span>
            <span>{data.date} {data.time}</span>
          </div>
          {data.userName && (
            <div className="flex justify-between">
              <span className="text-slate-500">ACCOUNT:</span>
              <span className="font-medium">{data.userName}</span>
            </div>
          )}
          {data.trackingPeriodName && (
            <div className="flex justify-between">
              <span className="text-slate-500">PERIOD:</span>
              <span className="font-medium">{data.trackingPeriodName}</span>
            </div>
          )}
        </div>

        {/* Title Block */}
        <div className="receipt-title py-1.5 px-2 text-center font-bold uppercase tracking-wider text-[11px] bg-slate-100 my-2 rounded border border-slate-200">
          {data.title}
        </div>

        {/* Transaction Items */}
        <div className="py-2 space-y-2.5 border-b border-dashed border-slate-400">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase pb-1 border-b border-dotted border-slate-300">
            <span>Description</span>
            <span>Amount</span>
          </div>

          {data.items.length === 0 ? (
            <div className="text-center py-2 text-slate-400 text-xs italic">
              No transactions in this period
            </div>
          ) : (
            data.items.map((item, idx) => (
              <div key={idx} className="receipt-item-row flex justify-between items-start gap-2 pt-0.5">
                <div className="flex-1 min-w-0 pr-1">
                  <p className="font-bold break-words whitespace-normal leading-tight">
                    {item.description}
                  </p>
                  <p className="text-[9px] text-slate-500 leading-normal mt-0.5 break-words">
                    {item.category || 'General'}
                    {item.wallet ? ` • ${item.wallet}` : ''}
                    {item.time ? ` • ${item.time}` : ''}
                  </p>
                </div>
                <span className="font-bold shrink-0 text-right tnum whitespace-nowrap pt-0.5">
                  {data.currency} {item.amount.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Totals Block */}
        <div className="receipt-totals py-3 space-y-1.5 border-b border-dashed border-slate-400 text-[11px]">
          {data.openingBalance !== undefined && (
            <div className="flex justify-between text-slate-600">
              <span>Opening Capital:</span>
              <span className="tnum font-medium">{data.currency} {data.openingBalance.toFixed(2)}</span>
            </div>
          )}

          {data.totalIncome > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Total Income (+):</span>
              <span className="tnum">+{data.currency} {data.totalIncome.toFixed(2)}</span>
            </div>
          )}

          {data.totalExpense > 0 && (
            <div className="flex justify-between font-black text-rose-700 text-xs sm:text-sm pt-0.5">
              <span>TOTAL EXPENSE (-):</span>
              <span className="tnum">{data.currency} {data.totalExpense.toFixed(2)}</span>
            </div>
          )}

          {data.closingBalance !== undefined && (
            <div className="flex justify-between font-black pt-1.5 text-slate-900 border-t border-dotted border-slate-400">
              <span>Closing Balance:</span>
              <span className="tnum">{data.currency} {data.closingBalance.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Barcode Simulator */}
        <div className="receipt-barcode py-3 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 h-7 opacity-85">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="bg-black h-full"
                style={{
                  width: i % 4 === 0 ? '3px' : i % 3 === 0 ? '2px' : '1px',
                  opacity: i % 5 === 0 ? 0.4 : 1,
                }}
              />
            ))}
          </div>
          <p className="text-[8px] tracking-widest text-slate-500 mt-1 uppercase font-mono">
            *{data.receiptNumber}*
          </p>
        </div>

        {/* Footer Block */}
        <div className="receipt-footer text-center pt-1 text-[9px] text-slate-500 space-y-0.5">
          <p className="font-bold uppercase">Thank you for tracking with DailySpend!</p>
          <p>Verified Accurate Personal Ledger</p>
          <p className="pt-1 font-mono">*** END OF RECEIPT ***</p>
        </div>
      </div>

      {/* Screen-only Jagged Bottom Edge */}
      <div className={`${getScreenContainerClass()} receipt-zigzag-bottom opacity-90 no-print`} />
    </div>
  );
};
