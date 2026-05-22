import {
  getTransferRatio,
  getTaxWarning,
  getOptimalTransferPathway,
} from '../utils/loyaltyMatrixEngine';

describe('Loyalty Transfer Matrix Engine (May 2026 Rules)', () => {
  describe('Axis Bank Devaluations & Ratios', () => {
    it('should block devalued partners (Marriott, Accor, Qatar) following the April 2, 2026 changes', () => {
      expect(getTransferRatio('axis_m4b', 'marriott')).toBe(0.0);
      expect(getTransferRatio('axis_m4b', 'marriott_bonvoy')).toBe(0.0);
      expect(getTransferRatio('axis_m4b', 'accor')).toBe(0.0);
      expect(getTransferRatio('axis_m4b', 'qatar_avios')).toBe(0.0);
    });

    it('should support valid partners at the M4B Burgundy 5:4 ratio (0.8)', () => {
      expect(getTransferRatio('axis_m4b', 'krisflyer')).toBe(0.8);
      expect(getTransferRatio('axis_m4b', 'aeroplan')).toBe(0.8);
      expect(getTransferRatio('axis_m4b', 'air_india')).toBe(0.8);
      expect(getTransferRatio('axis_m4b', 'turkish')).toBe(0.8);
    });
  });

  describe('American Express India Ratios', () => {
    it('should maintain Marriott at 1:1 and Hilton at 1:0.9', () => {
      expect(getTransferRatio('amex_platinum', 'marriott')).toBe(1.0);
      expect(getTransferRatio('amex_platinum', 'hilton')).toBe(0.9);
      expect(getTransferRatio('amex_platinum', 'taj')).toBe(0.5);
    });

    it('should transfer to partner airlines at a 2:1 ratio (0.5)', () => {
      expect(getTransferRatio('amex_platinum', 'krisflyer')).toBe(0.5);
      expect(getTransferRatio('amex_platinum', 'cathay')).toBe(0.5);
      expect(getTransferRatio('amex_platinum', 'british_airways')).toBe(0.5);
    });
  });

  describe('HSBC Premier Advantage', () => {
    it('should transfer 1:1 to premium hotel chains and airlines', () => {
      expect(getTransferRatio('hsbc_premier', 'accor')).toBe(1.0);
      expect(getTransferRatio('hsbc_premier', 'marriott_bonvoy')).toBe(1.0);
      expect(getTransferRatio('hsbc_premier', 'krisflyer')).toBe(1.0);
      expect(getTransferRatio('hsbc_premier', 'flying_blue')).toBe(1.0);
    });
  });

  describe('Closed-Loop Co-branded Card Sweeps', () => {
    it('should sweep 1:1 strictly to the designated target partner program', () => {
      expect(getTransferRatio('indusind_qatar', 'qatar_avios')).toBe(1.0);
      expect(getTransferRatio('indusind_qatar', 'marriott_bonvoy')).toBe(0.0);

      expect(getTransferRatio('hdfc_marriott', 'marriott_bonvoy')).toBe(1.0);
      expect(getTransferRatio('hdfc_marriott', 'accor')).toBe(0.0);
    });
  });

  describe('Fuel Surcharge & Surcharge Tax Heuristics', () => {
    it('should flag high tax airlines with warnings', () => {
      const fbWarning = getTaxWarning('flying_blue');
      expect(fbWarning.warning).toBe(true);
      expect(fbWarning.message).toContain('High Cash Surcharges');

      const turkishWarning = getTaxWarning('turkish');
      expect(turkishWarning.warning).toBe(true);
    });

    it('should recommend low tax airlines with no warning', () => {
      const aeroplanWarning = getTaxWarning('aeroplan');
      expect(aeroplanWarning.warning).toBe(false);
      expect(aeroplanWarning.message).toContain('Zero or extremely low');

      const krisflyerWarning = getTaxWarning('krisflyer');
      expect(krisflyerWarning.warning).toBe(false);
    });
  });

  describe('Optimal Wallet Transfer Recommendations', () => {
    it('should compute points required and sort pathways by transfer efficiency', () => {
      const wallet = {
        hsbc_premier: 50000,
        axis_m4b: 60000,
        amex_platinum: 100000,
      };

      // Need 40,000 Singapore KrisFlyer miles
      const recs = getOptimalTransferPathway('krisflyer', 40000, wallet);

      // HSBC: 40k miles / 1.0 ratio = 40,000 points. (Feasible!)
      // Axis: 40k miles / 0.8 ratio = 50,000 points. (Feasible!)
      // Amex: 40k miles / 0.5 ratio = 80,000 points. (Feasible!)

      expect(recs.length).toBe(3);

      // Should be sorted by ratio descending (highest efficiency first)
      expect(recs[0].cardId).toBe('hsbc_premier'); // 1.0 ratio
      expect(recs[0].pointsRequired).toBe(40000);
      expect(recs[0].isFeasible).toBe(true);

      expect(recs[1].cardId).toBe('axis_m4b'); // 0.8 ratio
      expect(recs[1].pointsRequired).toBe(50000);
      expect(recs[1].isFeasible).toBe(true);

      expect(recs[2].cardId).toBe('amex_platinum'); // 0.5 ratio
      expect(recs[2].pointsRequired).toBe(80000);
      expect(recs[2].isFeasible).toBe(true);
    });

    it('should correctly flag path feasibility when points are insufficient', () => {
      const wallet = {
        hsbc_premier: 10000, // Insufficient (needs 40k)
        axis_m4b: 60000,     // Sufficient (needs 50k)
      };

      const recs = getOptimalTransferPathway('krisflyer', 40000, wallet);

      expect(recs.find(r => r.cardId === 'hsbc_premier')?.isFeasible).toBe(false);
      expect(recs.find(r => r.cardId === 'axis_m4b')?.isFeasible).toBe(true);
    });
  });

  describe('Minor Cards and Edge Cases', () => {
    it('should calculate ratios for Yes Private and SBI Aurum', () => {
      expect(getTransferRatio('yes_private', 'air_india')).toBe(1.0);
      expect(getTransferRatio('yes_private', 'adani_one')).toBe(1.0);
      expect(getTransferRatio('yes_private', 'marriott')).toBe(0.0);
      expect(getTransferRatio('non_existent_card', 'air_india')).toBe(0.0);

      expect(getTransferRatio('sbi_aurum', 'air_india')).toBe(0.2);
      expect(getTransferRatio('sbi_aurum', 'adani_one')).toBe(0.25);
      expect(getTransferRatio('sbi_aurum', 'marriott')).toBe(0.0);
    });

    it('should recommend correct notes for SBI Aurum', () => {
      const wallet = { sbi_aurum: 50000 };
      const recs = getOptimalTransferPathway('air_india', 10000, wallet);
      expect(recs[0].notes).toContain('Low yield devaluation');
    });

    it('should sort feasible cards first when ratios are equal', () => {
      const recs = getOptimalTransferPathway('qatar_avios', 20000, {
        hsbc_premier: 10000,
        indusind_qatar: 30000,
      });
      expect(recs[0].cardId).toBe('indusind_qatar');
      expect(recs[1].cardId).toBe('hsbc_premier');
    });

    it('should return default empty tax warning for unknown partners', () => {
      expect(getTaxWarning('unknown_partner')).toEqual({ warning: false });
    });

    it('should return 0 when card has no pathway to partner (unmatched partners branches)', () => {
      // Axis Atlas unmatched partner branch
      expect(getTransferRatio('axis_m4b', 'taj')).toBe(0.0);
      // Amex Platinum unmatched partner branch
      expect(getTransferRatio('amex_platinum', 'adani_one')).toBe(0.0);
      // HSBC Premier unmatched partner branch
      expect(getTransferRatio('hsbc_premier', 'taj')).toBe(0.0);
    });

    it('should handle sorting where feasibility is equal and ratios are equal', () => {
      // both true
      const recs = getOptimalTransferPathway('air_india', 5000, {
        hsbc_premier: 10000,
        yes_private: 10000,
      });
      expect(recs.length).toBe(2);
      expect(recs[0].ratio).toBe(1.0);
      expect(recs[1].ratio).toBe(1.0);

      // false and true
      const recs2 = getOptimalTransferPathway('air_india', 20000, {
        hsbc_premier: 10000, // false
        yes_private: 30000,  // true
      });
      expect(recs2[0].cardId).toBe('yes_private');

      // true and false
      const recs3 = getOptimalTransferPathway('air_india', 20000, {
        yes_private: 30000,  // true
        hsbc_premier: 10000, // false
      });
      expect(recs3[0].cardId).toBe('yes_private');

      // both false
      const recs4 = getOptimalTransferPathway('air_india', 20000, {
        hsbc_premier: 10000, // false
        yes_private: 5000,   // false
      });
      expect(recs4.length).toBe(2);
    });
  });
});
