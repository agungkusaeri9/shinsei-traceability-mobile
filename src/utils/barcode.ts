/**
 * Utility functions for handling barcodes and QR codes.
 */

/**
 * Extracts the STK number from scanned barcode/QR value.
 * Supports both:
 * - New composite format: "stk;pddm;qty" (extracts "stk")
 * - Legacy plain format: "stk"
 *
 * @param value Raw scanned string from barcode or QR scanner
 * @returns Extracted and trimmed STK number string
 */
export const extractStkNumber = (value: string): string => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (trimmed.includes(';')) {
    const parts = trimmed.split(';');
    return (parts[0] ?? '').trim();
  }

  return trimmed;
};
