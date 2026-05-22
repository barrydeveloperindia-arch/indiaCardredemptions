import { getCardMultiplier } from '../utils/mccChecker';

describe('MCC Multiplier Checker', () => {
  it('should return 5x multiplier for Zomato dining on HDFC Infinia', () => {
    // Dining MCC should map to 5x on HDFC Infinia (dining multiplier)
    expect(getCardMultiplier('Zomato', 'hdfc_infinia')).toBe(5);
  });

  it('should return 5x multiplier for Uber travel on Axis Atlas', () => {
    // Travel MCC should map to 5x on Axis Atlas
    expect(getCardMultiplier('Uber', 'axis_atlas')).toBe(5);
  });

  it('should return 0x multiplier for rental descriptors on Axis Atlas (exclusion)', () => {
    // Rent payments are excluded (0x)
    expect(getCardMultiplier('Landlord Rent payment', 'axis_atlas')).toBe(0);
  });

  it('should return 1x baseline multiplier for general shopping on Amex Platinum', () => {
    // Shopping MCC defaults to baseline 1x
    expect(getCardMultiplier('Amazon', 'amex_platinum')).toBe(1);
  });

  it('should return 1x baseline multiplier for unknown merchants and cards', () => {
    expect(getCardMultiplier('Unknown Grocery Store', 'hdfc_infinia')).toBe(1);
    expect(getCardMultiplier('Zomato', 'invalid_card')).toBe(1);
  });

  it('should resolve fallback keyword matches for wallet, utilities, and travel', () => {
    // Wallet load fallback check (should return 0 for Axis Atlas)
    expect(getCardMultiplier('Paytm load money', 'axis_atlas')).toBe(0);

    // Utility bill fallback check (should return 0 for Axis Atlas)
    expect(getCardMultiplier('State Gas Bill', 'axis_atlas')).toBe(0);

    // Flight booking fallback check (should return 5 for Axis Atlas)
    expect(getCardMultiplier('Mumbai to London Flight booking', 'axis_atlas')).toBe(5);

    // Non-travel spend (like Zomato dining) on Axis Atlas should default to 1x
    expect(getCardMultiplier('Zomato dining spend', 'axis_atlas')).toBe(1);
  });
});
