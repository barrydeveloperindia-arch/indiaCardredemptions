import loyaltyMatrix from '../data/loyaltyMatrix.json';

describe('Loyalty Matrix Database', () => {
  it('should contain Axis M4B with Marriott at 5:4 ratio', () => {
    // Note: Accor, Marriott, and Qatar Airways were officially removed on April 2, 2026 for Axis.
    // However, the MASTER_PROMPT specifically asked to map e.g. Axis M4B -> Marriott = 5:4, 
    // HDFC Infinia -> Accor = 1:1, Amex -> Marriott = 1:1 as examples. 
    // We will follow the specific instruction for the structure.
    // The test expects these keys to exist.
    expect(loyaltyMatrix).toHaveProperty('axis_m4b');
    const m4bPartners = (loyaltyMatrix as any).axis_m4b.partners;
    expect(m4bPartners.marriott).toBeDefined();
    expect(m4bPartners.marriott.ratio).toBe(0.8); // 5:4
  });

  it('should contain HDFC Infinia with Accor at 1:1 ratio', () => {
    expect(loyaltyMatrix).toHaveProperty('hdfc_infinia');
    const infiniaPartners = (loyaltyMatrix as any).hdfc_infinia.partners;
    expect(infiniaPartners.accor).toBeDefined();
    expect(infiniaPartners.accor.ratio).toBe(1.0);
  });

  it('should contain Amex with Marriott at 1:1 ratio', () => {
    expect(loyaltyMatrix).toHaveProperty('amex_platinum');
    const amexPartners = (loyaltyMatrix as any).amex_platinum.partners;
    expect(amexPartners.marriott).toBeDefined();
    expect(amexPartners.marriott.ratio).toBe(1.0);
  });
});
