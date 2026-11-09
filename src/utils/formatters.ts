import { format, isToday, isYesterday, parseISO } from 'date-fns';

/**
 * Formats a monetary number with the provided currency symbol (default '৳')
 * and standard thousand separators
 */
export function formatCurrency(
  amount: number,
  currencySymbol = '৳',
  showDecimals = true
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formattedNumber = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return `${isNegative ? '-' : ''}${currencySymbol} ${formattedNumber}`;
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) into friendly human readable format
 */
export function formatDate(dateStr: string, dateFormat = 'MMM d, yyyy'): string {
  try {
    const date = parseISO(dateStr.length === 10 ? `${dateStr}T12:00:00` : dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, dateFormat);
  } catch {
    return dateStr;
  }
}

/**
 * Formats time from HH:mm or ISO to 12h or 24h format
 */
export function formatTime(timeStr: string, format12h = true): string {
  if (!timeStr) return '';
  try {
    if (timeStr.includes(':') && timeStr.length <= 5) {
      const [hStr, mStr] = timeStr.split(':');
      let hours = parseInt(hStr, 10);
      const minutes = mStr || '00';
      if (!format12h) return `${String(hours).padStart(2, '0')}:${minutes}`;

      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 hour is 12 AM
      return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    }
    const d = new Date(timeStr);
    return format(d, format12h ? 'hh:mm a' : 'HH:mm');
  } catch {
    return timeStr;
  }
}

/**
 * Formats a short timeline timestamp (e.g., '07:30 AM')
 */
export function formatTimelineTime(timeStr: string): string {
  return formatTime(timeStr, true);
}

