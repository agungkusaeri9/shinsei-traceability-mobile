/**
 * Format currency to IDR
 * @example formatCurrency(150000) => 'Rp 150.000'
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

/**
 * Format number with thousand separator
 * @example formatNumber(1500000) => '1.500.000'
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

/**
 * Truncate long string with ellipsis
 * @example truncateText('Hello World', 5) => 'Hello...'
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter of each word
 * @example toTitleCase('hello world') => 'Hello World'
 */
export const toTitleCase = (text: string): string => {
  return text.replace(/\w\S*/g, word => {
    return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
  });
};

/**
 * Get user initials from full name
 * @example getInitials('Agung Kusaeri') => 'AK'
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};
