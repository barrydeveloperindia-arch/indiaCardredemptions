export interface PointSale {
  id: string;
  partner: string;
  bonusPercentage: number;
  basePointsBought: number;
  bonusPointsReceived: number;
  totalUsdCost: number;
  endDate: string;
  description: string;
}

export const pointSales: PointSale[] = [
  {
    id: 'hilton_100_may26',
    partner: 'Hilton Honors',
    bonusPercentage: 100,
    basePointsBought: 10000,
    bonusPointsReceived: 10000,
    totalUsdCost: 100,
    endDate: 'May 29, 2026',
    description: 'Buy Hilton points with a 100% bonus. Excellent for booking luxury resorts in the Maldives or Bora Bora where cash rates exceed $1,500/night.',
  },
  {
    id: 'qatar_50_may26',
    partner: 'Qatar Privilege Club',
    bonusPercentage: 50,
    basePointsBought: 20000,
    bonusPointsReceived: 10000,
    totalUsdCost: 480,
    endDate: 'May 25, 2026',
    description: 'Qatar Avios 50% buy bonus. Speculative buying rarely pays off unless you have an immediate Qsuites redemption on hold.',
  }
];

export interface CostData {
  totalPoints: number;
  totalInrCost: number;
  inrCostPerPoint: number;
}

// Assumes a fixed USD to INR conversion of 85 for estimation purposes
const USD_TO_INR = 85;

export function calculateCostPerPoint(sale: PointSale): CostData {
  const totalPoints = sale.basePointsBought + sale.bonusPointsReceived;
  const totalInrCost = sale.totalUsdCost * USD_TO_INR;
  const inrCostPerPoint = totalInrCost / totalPoints;
  
  return {
    totalPoints,
    totalInrCost,
    inrCostPerPoint
  };
}

export interface WalletRecommendation {
  shouldBuy: boolean;
  reason: string;
}

export function getWalletRecommendation(sale: PointSale, userWallet: Record<string, any>): WalletRecommendation {
  // Logic to cross-reference Avios sales against the Axis Atlas card
  if (sale.partner === 'Qatar Privilege Club' || sale.partner === 'British Airways') {
    if (userWallet['axis_atlas']) {
      return {
        shouldBuy: false,
        reason: 'You hold the Axis Atlas card! Do NOT buy these points. You can directly transfer Edge Miles to Qatar Avios at a 1:2 ratio instead.'
      };
    }
  }

  // Logic to cross-reference Hilton against Amex Platinum
  if (sale.partner === 'Hilton Honors') {
    if (userWallet['amex_platinum']) {
      return {
        shouldBuy: false,
        reason: 'You hold Amex Platinum. Wait for a transfer bonus event or transfer MR points directly at a 1:2.5 ratio instead of paying cash.'
      };
    }
  }

  return {
    shouldBuy: true,
    reason: `You do not hold any Indian credit cards that transfer efficiently to ${sale.partner}. If you have an immediate redemption planned, buying points here is recommended.`
  };
}
