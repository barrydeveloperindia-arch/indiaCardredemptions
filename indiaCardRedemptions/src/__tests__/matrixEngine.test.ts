import { getTransferRatio } from '../utils/matrixEngine';

describe('Matrix Engine Calculations', () => {
  it('should return the correct ratio for Amex Platinum to Marriott Bonvoy', () => {
    // Amex Platinum -> Marriott Bonvoy is 1.0
    expect(getTransferRatio('amex_platinum', 'marriott_bonvoy')).toBe(1.0);
  });

  it('should return the correct ratio for Axis Magnus Burgundy to Krisflyer', () => {
    // Axis Magnus Burgundy -> Krisflyer is 0.8
    expect(getTransferRatio('axis_m4b', 'krisflyer')).toBe(0.8);
  });

  it('should return 0.0 for deactivated pathways (Axis to Marriott Bonvoy)', () => {
    // Axis -> Marriott Bonvoy is devalued and blocked (0.0)
    expect(getTransferRatio('axis_m4b', 'marriott_bonvoy')).toBe(0.0);
  });

  it('should return 0.0 for unknown cards or unknown partners', () => {
    expect(getTransferRatio('invalid_card', 'krisflyer')).toBe(0.0);
    expect(getTransferRatio('amex_platinum', 'invalid_partner')).toBe(0.0);
  });
});
