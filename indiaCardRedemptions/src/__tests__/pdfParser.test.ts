import { parseInfiniaStatement } from '../utils/pdfParser';

describe('Secure Local PDF Statement Parser', () => {
  it('should correctly parse standard HDFC Infinia credit card statement raw text', () => {
    const rawText = `
      HDFC BANK CREDIT CARD STATEMENT
      Statement Date: 15/10/2025
      Payment Due Date: 05/11/2025
      Total Spends: Rs. 1,45,230.50
      Points Earned: 4,890
      Payment Due: Rs. 1,45,230.50
      Reward Points Summary:
      Opening Balance: 12,000
      Earned: 4,890
      Disbursed: 0
      Closing Balance: 16,890
    `;

    const result = parseInfiniaStatement(rawText);

    expect(result.statementDate).toBe('15/10/2025');
    expect(result.totalSpends).toBe(145230.50);
    expect(result.pointsEarned).toBe(4890);
    expect(result.paymentDue).toBe(145230.50);
  });

  it('should handle alternative layouts with commas, spaces, and currency symbols', () => {
    const rawText = `
      Statement Date : 20-11-2025
      Total Spends : INR 50,000
      Points Earned : 1,200
      Payment Due : INR 50,000
    `;

    const result = parseInfiniaStatement(rawText);

    expect(result.statementDate).toBe('20-11-2025');
    expect(result.totalSpends).toBe(50000);
    expect(result.pointsEarned).toBe(1200);
    expect(result.paymentDue).toBe(50000);
  });

  it('should return default zero values when parsing unformatted text or empty inputs', () => {
    const result = parseInfiniaStatement('Random unstructured text blocks');
    expect(result.statementDate).toBe('');
    expect(result.totalSpends).toBe(0);
    expect(result.pointsEarned).toBe(0);
    expect(result.paymentDue).toBe(0);
  });
});
