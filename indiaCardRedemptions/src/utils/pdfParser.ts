export interface StatementParseResult {
  pointsEarned: number;
  totalSpends: number;
  paymentDue: number;
  statementDate: string;
}

/**
 * Parses raw text extracted from an HDFC Infinia credit card statement.
 * 
 * @param rawText Raw text content of the PDF statement
 * @returns Parsed fields including points, spends, and payment due amounts
 */
export function parseInfiniaStatement(rawText: string): StatementParseResult {
  let statementDate = '';
  let totalSpends = 0;
  let pointsEarned = 0;
  let paymentDue = 0;

  const lines = rawText.split('\n');

  for (const line of lines) {
    const cleanLine = line.trim();

    // 1. Extract Statement Date
    const dateMatch = cleanLine.match(/statement\s*date\s*:\s*([\d-/]+)/i);
    if (dateMatch) {
      statementDate = dateMatch[1].trim();
    }

    // 2. Extract Total Spends
    const spendsMatch = cleanLine.match(/total\s*spends\s*:\s*(?:Rs\.|INR)?\s*([\d,.]+)/i);
    if (spendsMatch) {
      totalSpends = parseFloat(spendsMatch[1].replace(/,/g, ''));
    }

    // 3. Extract Points Earned
    const pointsMatch = cleanLine.match(/(?:points\s*)?earned\s*:\s*([\d,]+)/i);
    if (pointsMatch) {
      pointsEarned = parseInt(pointsMatch[1].replace(/,/g, ''), 10);
    }

    // 4. Extract Payment Due (excluding due date lines)
    if (!/due\s*date/i.test(cleanLine)) {
      const dueMatch = cleanLine.match(/payment\s*due\s*:\s*(?:Rs\.|INR)?\s*([\d,.]+)/i);
      if (dueMatch) {
        paymentDue = parseFloat(dueMatch[1].replace(/,/g, ''));
      }
    }
  }

  return {
    statementDate,
    totalSpends,
    pointsEarned,
    paymentDue,
  };
}
