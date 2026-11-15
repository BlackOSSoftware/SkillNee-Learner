/** Money formatting helpers — display only; authoritative math stays on the backend. */

const formatterCache = new Map<string, Intl.NumberFormat>();

function formatter(currency: string): Intl.NumberFormat {
  const code = (currency || 'INR').toUpperCase();
  let f = formatterCache.get(code);
  if (!f) {
    try {
      f = new Intl.NumberFormat('en-IN', { style: 'currency', currency: code });
    } catch {
      f = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
    }
    formatterCache.set(code, f);
  }
  return f;
}

/** Format a major-unit amount (e.g. 499.00) with the given ISO currency. */
export function formatMoney(amount: number | null | undefined, currency = 'INR'): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  return formatter(currency).format(amount);
}

/** Format a minor-unit (paise/cents) amount. */
export function formatMinor(minor: number | null | undefined, currency = 'INR'): string {
  if (minor === null || minor === undefined || Number.isNaN(minor)) return '—';
  return formatter(currency).format(minor / 100);
}
