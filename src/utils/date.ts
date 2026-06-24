import { format, parseISO, isValid } from 'date-fns';

/**
 * Format date to readable string
 * @example formatDate('2024-01-15') => '15 January 2024'
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '-';
    return format(date, 'dd MMMM yyyy');
  } catch {
    return '-';
  }
};

/**
 * Format date with time
 * @example formatDateTime('2024-01-15T10:30:00') => '15 Jan 2024, 10:30'
 */
export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '-';
    return format(date, 'dd MMM yyyy, HH:mm');
  } catch {
    return '-';
  }
};

/**
 * Get relative time label (e.g. "2 hours ago")
 */
export const getRelativeTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '-';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  } catch {
    return '-';
  }
};
