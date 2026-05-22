export interface CardDetails {
  name: string;
  bank: string;
  isClosedLoop: boolean;
  sweepTarget?: string;
}

export interface RecommendationResult {
  cardId: string;
  cardName: string;
  ratio: number;
  pointsRequired: number;
  isFeasible: boolean;
  notes?: string;
}

// May 2026 Card Portfolio registry
export const CC_PORTFOLIO: { [cardId: string]: CardDetails } = {
  axis_m4b: { name: 'Axis Magnus for Burgundy', bank: 'Axis Bank', isClosedLoop: false },
  amex_platinum: { name: 'Amex Platinum Charge', bank: 'American Express', isClosedLoop: false },
  hsbc_premier: { name: 'HSBC Premier Credit Card', bank: 'HSBC', isClosedLoop: false },
  yes_private: { name: 'YES Bank Private', bank: 'YES Bank', isClosedLoop: false },
  sbi_aurum: { name: 'SBI AURUM', bank: 'SBI Card', isClosedLoop: false },
  indusind_qatar: { name: 'IndusInd Qatar Airways Visa Infinite', bank: 'IndusInd', isClosedLoop: true, sweepTarget: 'qatar_avios' },
  hdfc_marriott: { name: 'HDFC Marriott Bonvoy', bank: 'HDFC Bank', isClosedLoop: true, sweepTarget: 'marriott_bonvoy' },
  hdfc_tata_neu: { name: 'HDFC Tata Neu Infinity', bank: 'HDFC Bank', isClosedLoop: true, sweepTarget: 'tata_neu' },
};

/**
 * Gets the transfer ratio from a given credit card to a specific loyalty program.
 * Incorporates devaluations as of May 2026.
 * Returns 0 if no transfer pathway exists.
 */
export function getTransferRatio(cardId: string, partner: string): number {
  if (!CC_PORTFOLIO[cardId]) return 0;

  const card = CC_PORTFOLIO[cardId];

  // If the card is closed-loop, it sweeps 1:1 to its designated sweep target only
  if (card.isClosedLoop) {
    return card.sweepTarget === partner ? 1.0 : 0.0;
  }

  // 1. Axis Bank (Atlas / Magnus for Burgundy)
  // Devaluation Alert: Accor, Marriott, and Qatar Airways were officially removed on April 2, 2026.
  if (cardId === 'axis_m4b') {
    const blockedPartners = ['accor', 'marriott', 'marriott_bonvoy', 'qatar', 'qatar_avios'];
    if (blockedPartners.includes(partner)) {
      return 0.0; // Pathway deactivated
    }

    // Standard transfer ratio for M4B is 5:4 (0.8)
    const axisPartners = [
      'aeroplan', 'british_airways', 'etihad', 'ethiopian', 'finnair',
      'jal', 'krisflyer', 'thai', 'turkish', 'united', 'vietnam_airlines',
      'wyndham', 'flying_blue', 'air_india', 'airasia', 'qantas', 'spicejet',
      'ihg', 'club_itc', 'radisson'
    ];

    if (axisPartners.includes(partner)) {
      return 0.8;
    }
  }

  // 2. American Express India (Platinum Charge / Travel)
  if (cardId === 'amex_platinum') {
    // Hotels
    if (partner === 'marriott' || partner === 'marriott_bonvoy') return 1.0;
    if (partner === 'hilton') return 0.9;
    if (partner === 'taj' || partner === 'neupass') return 0.5;

    // Airlines (2:1 ratio = 0.5)
    const amexAirlines = [
      'british_airways', 'cathay', 'emirates', 'etihad', 'qatar', 'qatar_avios', 'krisflyer', 'virgin_atlantic'
    ];
    if (amexAirlines.includes(partner)) {
      return 0.5;
    }
  }

  // 3. HSBC Premier (Emerges as the ultimate hotel/mileage transfer card in 2026)
  if (cardId === 'hsbc_premier') {
    const hsbcPartners = [
      'accor', 'ihg', 'marriott', 'marriott_bonvoy', 'shangri_la', 'wyndham',
      'air_india', 'airasia', 'flying_blue', 'british_airways', 'etihad', 'eva_air',
      'fortune_wings', 'jal', 'qantas', 'qatar', 'qatar_avios', 'krisflyer', 'thai',
      'turkish', 'united', 'vietnam_airlines'
    ];

    if (hsbcPartners.includes(partner)) {
      return 1.0; // All transfer pathways are 1:1!
    }
  }

  // 4. YES Bank Private
  if (cardId === 'yes_private') {
    if (partner === 'air_india') return 1.0;
    if (partner === 'adani_one') return 1.0;
  }

  // 5. SBI AURUM
  if (cardId === 'sbi_aurum') {
    if (partner === 'air_india') return 0.2; // 5:1 (Terrible value)
    if (partner === 'adani_one') return 0.25; // 4:1
  }

  return 0.0; // No pathway
}

/**
 * Checks if a specific transfer partner carries a dynamic fuel surcharge tax warning.
 */
export function getTaxWarning(partner: string): { warning: boolean; message?: string } {
  const highTaxPartners = ['flying_blue', 'turkish', 'british_airways'];
  if (highTaxPartners.includes(partner)) {
    return {
      warning: true,
      message: 'Expect High Cash Surcharges (₹25k - ₹40k+). Only book during promo windows.',
    };
  }

  const zeroTaxPartners = ['aeroplan', 'krisflyer', 'vietnam_airlines'];
  if (zeroTaxPartners.includes(partner)) {
    return {
      warning: false,
      message: 'Zero or extremely low carrier-imposed fuel surcharges. Highly recommended!',
    };
  }

  return { warning: false };
}

/**
 * Recommends which card in a user's wallet is mathematically optimal to transfer to a specific partner.
 */
export function getOptimalTransferPathway(
  partner: string,
  requiredMiles: number,
  userWalletBalances: { [cardId: string]: number }
): RecommendationResult[] {
  const recommendations: RecommendationResult[] = [];

  for (const cardId in userWalletBalances) {
    const ratio = getTransferRatio(cardId, partner);
    if (ratio > 0) {
      const balance = userWalletBalances[cardId];
      const pointsRequired = Math.ceil(requiredMiles / ratio);
      const isFeasible = balance >= pointsRequired;

      let notes = '';
      if (cardId === 'hsbc_premier') {
        notes = '👑 1:1 Premier Pathway. Max value!';
      } else if (cardId === 'axis_m4b' && ratio === 0.8) {
        notes = 'Burgundy 5:4 Pathway.';
      } else if (cardId === 'sbi_aurum') {
        notes = '⚠️ Low yield devaluation. Avoid if possible.';
      }

      recommendations.push({
        cardId,
        cardName: CC_PORTFOLIO[cardId].name,
        ratio,
        pointsRequired,
        isFeasible,
        notes: notes || undefined,
      });
    }
  }

  // Sort: highest ratio first (less points required), then feasibility
  return recommendations.sort((a, b) => {
    if (b.ratio !== a.ratio) {
      return b.ratio - a.ratio; // Prefer higher ratio
    }
    return (b.isFeasible ? 1 : 0) - (a.isFeasible ? 1 : 0); // Prefer feasible pathways
  });
}
