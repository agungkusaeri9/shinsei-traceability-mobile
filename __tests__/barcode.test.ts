import { extractStkNumber } from '../src/utils/barcode';

describe('extractStkNumber', () => {
  it('should extract stk from new format "stk;pddm;qty"', () => {
    expect(extractStkNumber('STK-2023001;PDDM-001;100')).toBe('STK-2023001');
  });

  it('should extract stk when there are spaces around semicolons', () => {
    expect(extractStkNumber('  STK-999 ; PDDM-888 ; 50  ')).toBe('STK-999');
  });

  it('should extract stk when newline or carriage returns are present', () => {
    expect(extractStkNumber('STK-ABC123;PDDM-XYZ;200\r\n')).toBe('STK-ABC123');
  });

  it('should return plain STK as-is if no semicolon is present (legacy format)', () => {
    expect(extractStkNumber('STK-2023001')).toBe('STK-2023001');
    expect(extractStkNumber('  STK-2023001  ')).toBe('STK-2023001');
  });

  it('should handle empty or invalid inputs gracefully', () => {
    expect(extractStkNumber('')).toBe('');
    expect(extractStkNumber('   ')).toBe('');
    expect(extractStkNumber(null as any)).toBe('');
    expect(extractStkNumber(undefined as any)).toBe('');
  });

  it('should handle trailing semicolon properly', () => {
    expect(extractStkNumber('STK-2023001;')).toBe('STK-2023001');
  });
});
