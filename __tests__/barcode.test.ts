import { extractStkNumber, extractPartNo } from '../src/utils/barcode';

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

describe('extractPartNo', () => {
  it('should take only the first token when separated by spaces', () => {
    expect(extractPartNo('xxxx bbbb')).toBe('xxxx');
    expect(extractPartNo('A1 B2 C3')).toBe('A1');
  });

  it('should take only the first token when separated by newlines', () => {
    expect(extractPartNo('xxxxx\n\nbbbb')).toBe('xxxxx');
    expect(extractPartNo('A1\r\nB2')).toBe('A1');
    expect(extractPartNo('A1\nB2\nC3')).toBe('A1');
  });

  it('should handle tabs and mixed whitespace as separators', () => {
    expect(extractPartNo('A1\tB2')).toBe('A1');
    expect(extractPartNo('  A1   B2  ')).toBe('A1');
    expect(extractPartNo('A1 \n\t B2')).toBe('A1');
  });

  it('should return plain part number as-is if no whitespace is present', () => {
    expect(extractPartNo('PART-12345')).toBe('PART-12345');
    expect(extractPartNo('  PART-12345  ')).toBe('PART-12345');
  });

  it('should handle empty or invalid inputs gracefully', () => {
    expect(extractPartNo('')).toBe('');
    expect(extractPartNo('   ')).toBe('');
    expect(extractPartNo('\n\n')).toBe('');
    expect(extractPartNo(null as any)).toBe('');
    expect(extractPartNo(undefined as any)).toBe('');
  });
});
