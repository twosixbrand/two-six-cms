/**
 * Centralized date formatting utilities for Two Six CMS.
 *
 * - Date-only fields  → YYYY-MM-DD
 * - DateTime fields   → YYYY-MM-DD HH:mm:ss  (24-hour, ISO 8601 extended)
 */

/**
 * Formats a date value as YYYY-MM-DD.
 * Returns '—' when the input is falsy or results in an invalid date.
 */
export const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Formats a datetime value as YYYY-MM-DD HH:mm:ss (24-hour clock).
 * Returns '—' when the input is falsy or results in an invalid date.
 */
export const formatDateTime = (value: string | Date | null | undefined): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  const yyyy = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mo}-${dd} ${hh}:${mi}:${ss}`;
};
