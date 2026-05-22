import { calculateYield, calculateVpp } from '../utils/arbitrageCalculator';

describe('Arbitrage Calculator', () => {
  it('should calculate correct Value per Point (VPP) based on cash price, points cost, and transfer ratio', () => {
    // Cash price ₹30000, points cost 15000, ratio 1.25
    // Card points needed = 15000 / 1.25 = 12000
    // VPP = 30000 / 12000 = 2.5
    expect(calculateVpp(30000, 15000, 1.25)).toBe(2.5);
  });

  it('should return 0 when points price or transfer ratio is zero or negative for VPP', () => {
    expect(calculateVpp(30000, 0, 1.25)).toBe(0);
    expect(calculateVpp(30000, 15000, 0)).toBe(0);
    expect(calculateVpp(30000, 15000, -1)).toBe(0);
  });

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
