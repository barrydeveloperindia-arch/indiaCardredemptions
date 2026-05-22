import { calculateYield } from '../utils/arbitrageCalculator';

describe('Arbitrage Calculator', () => {
  it('should calculate correct Rupee per Point yield based on transfer ratio', () => {
    // e.g. Cash price ₹10000, points price 5000, ratio 5:4 (0.8)
    // Points needed from card = 5000 / 0.8 = 6250
    // Yield = 10000 / 6250 = 1.6
    expect(calculateYield(10000, 5000, 0.8)).toBe(1.6);
  });

  it('should handle 1:1 transfer ratio correctly', () => {
    // Cash price ₹15000, points price 10000, ratio 1:1
    // Points needed from card = 10000
    // Yield = 15000 / 10000 = 1.5
    expect(calculateYield(15000, 10000, 1)).toBe(1.5);
  });

  it('should return 0 when transfer ratio is zero or negative', () => {
    expect(calculateYield(10000, 5000, 0)).toBe(0);
    expect(calculateYield(10000, 5000, -0.5)).toBe(0);
  });
});
