export interface MCCCheckResult {
  merchant: string;
  isEligible: boolean;
  rewardMultiplier: number;
  reason: string;
}

export function checkAtlasEligibility(merchant: string): MCCCheckResult {
  const query = merchant.toLowerCase().trim();
  
  if (query.includes('bharatnxt') || query.includes('pice') || query.includes('bharat nxt')) {
    return {
      merchant,
      isEligible: false,
      rewardMultiplier: 0,
      reason: 'Axis Atlas explicitly excludes Edge Miles for payments processed through commercial utility/arbitrage gateways like BharatNXT and Pice.',
    };
  }
  
  if (query.includes('rent') || query.includes('landlord')) {
    return {
      merchant,
      isEligible: false,
      rewardMultiplier: 0,
      reason: 'Excluded. Rental transactions are blocked from earning Edge Miles across all Axis Bank credit cards.',
    };
  }

  if (query.includes('wallet') || query.includes('paytm') || query.includes('mobikwik') || query.includes('load')) {
    return {
      merchant,
      isEligible: false,
      rewardMultiplier: 0,
      reason: 'Excluded. Wallet loading transactions do not earn reward points or contribute to milestone spends.',
    };
  }

  if (query.includes('utility') || query.includes('bill') || query.includes('electricity') || query.includes('gas')) {
    return {
      merchant,
      isEligible: false,
      rewardMultiplier: 0,
      reason: 'Excluded. Standard utility bills earn 0 Edge Miles to prevent industrial bill arbitrage.',
    };
  }

  if (query.includes('gold') || query.includes('jewelry') || query.includes('jeweller')) {
    return {
      merchant,
      isEligible: true,
      rewardMultiplier: 1,
      reason: 'Eligible General Spends (Capped). Jewelry transactions earn standard 1 Edge Mile per ₹100, capped at 10,000 miles per month.',
    };
  }
  
  if (
    query.includes('hotel') || 
    query.includes('airline') || 
    query.includes('travel edge') || 
    query.includes('flight') ||
    query.includes('booking')
  ) {
    return {
      merchant,
      isEligible: true,
      rewardMultiplier: 5,
      reason: 'Accelerated Travel Category! Earns 5 Edge Miles per ₹100 spend (convertible to 10 partner miles, worth a massive 10% base yield!).',
    };
  }
  
  return {
    merchant,
    isEligible: true,
    rewardMultiplier: 1,
    reason: 'Eligible General Category. Earns baseline 1 Edge Mile per ₹100 spend (convertible to 2 partner miles, a solid 2% base yield).',
  };
}

export interface CardInsight {
  cardId: string;
  cardName: string;
  category: string;
  title: string;
  description: string;
  icon: string;
  bulletPoints: string[];
}

export const cardInsights: CardInsight[] = [
  {
    cardId: 'axis_atlas',
    cardName: 'Axis Bank Atlas',
    category: 'Exclusions & Spends',
    title: 'Axis Atlas MCC Arbitrage Rules',
    description: 'Axis Atlas is the premier airmiles card in India, but it has strict merchant exclusions designed to block commercial bill pay platforms.',
    icon: 'INFO',
    bulletPoints: [
      'Inclusions: In-store shopping, international currency spends, dining, online aggregators, and direct travel spends.',
      'Strict Exclusions: Rental transactions, utilities, government tax payments, and wallet loading (Paytm/Mobikwik).',
      'Gateway Exclusions: High-volume payment gateways simulating personal spends like BharatNXT and Pice earn 0 Edge Miles.',
      'Travel Edge Cap: Booking through Travel Edge earns 5x Edge Miles but is capped at 10,000 miles per statement cycle.'
    ]
  },
  {
    cardId: 'indusind_avios',
    cardName: 'IndusInd Avios Infinite',
    category: 'Milestone Rewards',
    title: 'IndusInd Avios Selection & Milestones',
    description: 'The IndusInd Avios card provides direct, devalue-protected transfers to Avios-based frequent flyer systems.',
    icon: 'AVIOS',
    bulletPoints: [
      'Partner Choice: Instantly select whether to credit earned Avios to Qatar Airways Privilege Club or British Airways Executive Club.',
      'Devaluation Proof: Transferring directly to Avios bypasses bank-side transfer ratio cuts.',
      'Milestone 1: Spend ₹1.5 Lakhs inside the card membership year and receive a bonus 5,000 Avios.',
      'Milestone 2: Spend ₹7.5 Lakhs within the year and receive a massive 25,000 bonus Avios.'
    ]
  },
  {
    cardId: 'hsbc_premier',
    cardName: 'HSBC Premier Card',
    category: 'Booking Parity',
    title: 'HSBC 1:1 Booking Multipliers',
    description: 'The HSBC Premier card maintains a standard 1:1 transfer ratio, making it an excellent baseline for international airline redemption programs.',
    icon: 'PREMIUM',
    bulletPoints: [
      'Travel Multipliers: Booking through the HSBC Travel With Points (TWP) portal yields an accelerated 12X points.',
      'Zero-Point Exclusions: Rent, government taxes, wallet loading, and corporate bill payments earn 0 points.',
      'Utility Cap: Utility spend is capped at ₹1 Lakh per statement cycle for reward earnings.',
      'Active Partners: Transfers to Singapore KrisFlyer, Air Canada Aeroplan, and British Airways Avios at a clean 1:1 ratio.'
    ]
  },
  {
    cardId: 'amex_travel',
    cardName: 'Amex Platinum Travel',
    category: 'Taj Upgrades',
    title: 'Amex Platinum Taj Upgrade Secrets',
    description: 'Beyond spend milestones, the Platinum Travel card unlocks elite tier upgrades across the premium Taj Hotels portfolio.',
    icon: 'TAJ',
    bulletPoints: [
      'Taj Voucher Unlock: Reaching the ₹7 Lakh spend milestone unlocks a ₹10,000 Taj Experiences e-Gift Card.',
      'Taj InnerCircle Gold: Complimentary gold tier membership in the Taj loyalty system, offering late checkouts and active upgrade vouchers.',
      'Amex Multiplier: Buying Taj vouchers via the Gyftr portal yields 5X membership points, compounding rewards by 10%.',
      'Milestone Points: ₹4 Lakh spend yields a total of 32,500 bonus membership points, convertible to Marriott/Airlines.'
    ]
  }
];

export interface MultiDipStrategy {
  id: string;
  name: string;
  type: 'double' | 'triple';
  cardName: string;
  hotelPartner: string;
  description: string;
  icon: string;
  steps: string[];
  calculateReturn: (spend: number) => {
    pointsEarned: number;
    valueBackINR: number;
    roi: number;
  };
}

export const multiDipStrategies: MultiDipStrategy[] = [
  {
    id: 'amex_gyftr_amazon',
    name: 'Amex Gyftr-Amazon Pay Surcharge-Free Bill Double Dip',
    type: 'double',
    cardName: 'Amex Gold / Platinum Travel',
    hotelPartner: 'Amazon Pay (Utilities)',
    description: 'Buy Amazon Pay vouchers via Amex Gyftr (accelerated multipliers) and use Amazon Pay to clear utility and insurance bills with zero surcharges.',
    icon: 'DOUBLE',
    steps: [
      'Step 1: Go to Amex Gyftr Multiplier portal.',
      'Step 2: Purchase Amazon Pay vouchers (earning 5X accelerated reward points).',
      'Step 3: Load the vouchers into your Amazon Pay Wallet (worth 1:1 in cash value).',
      'Step 4: Pay electricity, gas, insurance, or mobile bills on Amazon (0% surcharges compared to direct card bill swipes!).'
    ],
    calculateReturn: (spend: number) => {
      // 5X rewards (5 points per ₹100) -> 1 pt = ₹0.40 (baseline value) = 2.0% base return
      // Plus clear savings from utility card payment surcharges (approx 1.5% saved)
      // Plus card spend milestone progression (approx 6.5% incremental value back)
      const pointsEarned = Math.floor(spend * 0.05); // 5X points (5 points per ₹100 = 5% yield)
      const valueBackINR = pointsEarned * 0.40 + spend * 0.015 + spend * 0.065; 
      const roi = (valueBackINR / spend) * 100;
      return {
        pointsEarned,
        valueBackINR,
        roi
      };
    }
  },
  {
    id: 'atlas_marriott_direct',
    name: 'Atlas Direct Marriott Stay Double Dip',
    type: 'double',
    cardName: 'Axis Bank Atlas',
    hotelPartner: 'Marriott Bonvoy',
    description: 'Book a Marriott stay directly using Axis Atlas. You earn 5x Edge Miles on the swipe AND earn full Bonvoy points + elite tier benefits at check-in.',
    icon: 'HOTEL',
    steps: [
      'Step 1: Book hotel stay directly on the Marriott app/website.',
      'Step 2: Pay the final checkout checkout checkout bill using Axis Atlas (earning 5 Edge Miles per ₹100).',
      'Step 3: Provide your Marriott Bonvoy member ID during booking or at the reception desk.',
      'Step 4: Receive Marriott base points (10 pts per USD) + Elite bonus points + nights credit.'
    ],
    calculateReturn: (spend: number) => {
      // Axis Atlas: 5 Edge Miles/100 INR = 5% miles yield. worth 10 Bonvoy points/100 INR (10.0% return at ₹1/pt).
      // Marriott Base Stay: 10 points per USD (approx ₹85 exchange rate) = 11.7% points yield.
      // Total return = 10% (Atlas) + 11.7% (Marriott) = 21.7% points return.
      const pointsEarned = Math.floor((spend * 5 / 100) * 2) + Math.floor((spend / 85) * 10);
      const valueBackINR = pointsEarned * 1.00; // ₹1 per Marriott point
      const roi = (valueBackINR / spend) * 100;
      return {
        pointsEarned,
        valueBackINR,
        roi
      };
    }
  },
  {
    id: 'infinia_smartbuy_marriott',
    name: 'SmartBuy Infinia Marriott Bonvoy Stay Triple Dip',
    type: 'triple',
    cardName: 'HDFC Infinia',
    hotelPartner: 'Marriott Bonvoy',
    description: 'Buy Marriott gift vouchers on HDFC SmartBuy (10X points) and redeem them during a Marriott Bonvoy global double-points stay promotion.',
    icon: 'TRIPLE',
    steps: [
      'Step 1: Purchase Marriott e-Gift Cards on the HDFC SmartBuy voucher portal (earning 10X points, giving a massive 33.3% value back).',
      'Step 2: Register for the active Marriott Bonvoy seasonal stay promotion (e.g. 2,000 bonus points per stay).',
      'Step 3: Present and redeem your Marriott gift vouchers at checkout to pay the stay folio.',
      'Step 4: Earn Marriott stay points on the base amount + elite tier status bonuses + seasonal promo points!'
    ],
    calculateReturn: (spend: number) => {
      // HDFC SmartBuy Infinia: 10X points (3.3 pts per ₹100 * 10 = 33 pts per ₹100 worth ₹33, giving 33.3% ROI).
      // Marriott Base stay: 10 points per USD (approx 11.7% yield).
      // Marriott Promo: flat 2,000 points per stay (assume stay spend of spend) -> worth ₹2,000.
      const smartBuyPoints = Math.floor(spend * 0.33); 
      const marriottPoints = Math.floor((spend / 85) * 10) + 2000;
      const pointsEarned = smartBuyPoints + marriottPoints;
      // SmartBuy points are worth ₹1, Marriott points worth ₹1
      const valueBackINR = smartBuyPoints * 1.00 + marriottPoints * 1.00;
      const roi = (valueBackINR / spend) * 100;
      return {
        pointsEarned,
        valueBackINR,
        roi
      };
    }
  }
];
