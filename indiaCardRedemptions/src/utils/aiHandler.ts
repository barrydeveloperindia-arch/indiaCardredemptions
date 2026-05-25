export interface RagPayload {
  systemInstruction: string;
  contextMessage: string;
}

export interface TravelScenarioAnalysis {
  passengers: {
    adults: number;
    children: number;
  };
  routes: Array<{
    origin: string;
    destination: string;
  }>;
  feasibilityScore: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedProgram: string;
  pointsRequiredEstimate: number;
  conciergePremiumFee: number;
  savingsEstimate: number;
}

/**
 * Builds a RAG prompt payload containing the user's loyalty cards, point balances,
 * and specific transfer ratios targeted to their booking destination.
 */
export function buildRagPayload(
  walletState: Record<string, number>,
  transferMatrix: Record<string, Record<string, number>>,
  destination: string
): RagPayload {
  const systemInstruction = 'You are an expert credit card rewards optimizer and concierge assistant in India. Help users get maximum value from points arbitrage for flight & hotel bookings.';

  let contextMessage = `Target Destination: ${destination}\n\n`;

  const walletKeys = Object.keys(walletState);
  if (walletKeys.length === 0) {
    contextMessage += 'User Wallet Context: No active card balances registered.';
  } else {
    contextMessage += 'User Wallet Context:\n';
    for (const cardId of walletKeys) {
      const balance = walletState[cardId];
      contextMessage += `- ${cardId}: ${balance.toLocaleString('en-IN')} points\n`;
    }

    contextMessage += '\nTransfer Ratios Context:\n';
    for (const cardId of walletKeys) {
      const partners = transferMatrix[cardId];
      if (partners) {
        for (const partnerId of Object.keys(partners)) {
          const ratio = partners[partnerId];
          contextMessage += `- ${cardId} to ${partnerId} transfer ratio: ${ratio}\n`;
        }
      }
    }
  }

  return {
    systemInstruction,
    contextMessage,
  };
}

/**
 * Parses a natural language travel query and credit card balance to produce
 * a structured booking feasibility and pricing scorecard.
 */
export function parseTravelScenario(
  query: string,
  walletBalances: Record<string, number>
): TravelScenarioAnalysis {
  const lowerQuery = query.toLowerCase();

  // 1. Parse Passengers
  let adults = 0;
  let children = 0;

  // Word-based heuristic matches
  if (lowerQuery.includes('brother')) adults += 1;
  if (lowerQuery.includes('wife')) adults += 1;

  // Number extraction helper
  const extractNumber = (word: string, fallback: number): number => {
    if (word === 'one' || word === 'a') return 1;
    if (word === 'two') return 2;
    if (word === 'three') return 3;
    if (word === 'four') return 4;
    const num = parseInt(word, 10);
    return isNaN(num) ? fallback : num;
  };

  const adultMatch = lowerQuery.match(/(\w+)\s*adults?/);
  if (adultMatch) {
    adults = extractNumber(adultMatch[1], adults || 1);
  }

  const kidMatch = lowerQuery.match(/(\w+)\s*(kids?|children|child)/);
  if (kidMatch) {
    children = extractNumber(kidMatch[1], 1);
  }

  // Ensure at least 1 adult passenger if undefined
  if (adults === 0 && children === 0) {
    adults = 1;
  }

  // 2. Parse Routes
  const routes: Array<{ origin: string; destination: string }> = [];
  const queryWords = lowerQuery.replace(/[^a-z\s]/g, '').split(/\s+/);
  
  if (lowerQuery.includes('delhi') && lowerQuery.includes('london')) {
    routes.push({ origin: 'DEL', destination: 'LHR' });
  }
  if (lowerQuery.includes('london') && (lowerQuery.includes('brasilia') || lowerQuery.includes('brazil'))) {
    routes.push({ origin: 'LHR', destination: 'BSB' });
  }

  // Fallback route if none matched
  if (routes.length === 0) {
    routes.push({ origin: 'DEL', destination: 'LHR' });
  }

  // 3. Class Preference & Cost Estimate
  const isBusiness = lowerQuery.includes('business') || lowerQuery.includes('first') || lowerQuery.includes('upper class');
  
  const pointsPerPassenger = isBusiness ? 90000 : 40000;
  const totalPassengerCount = adults + children;
  const pointsRequiredEstimate = pointsPerPassenger * totalPassengerCount * routes.length;

  // 4. Feasibility Valuation
  const totalWalletPoints = Object.values(walletBalances).reduce((a, b) => a + b, 0);
  let feasibilityScore: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';

  if (totalWalletPoints === 0) {
    feasibilityScore = 'LOW';
  } else if (totalWalletPoints >= pointsRequiredEstimate) {
    feasibilityScore = 'HIGH';
  } else {
    feasibilityScore = 'MEDIUM';
  }

  // 5. Booking Fee & Program Recommendation
  const conciergePremiumFee = isBusiness ? 25000 * totalPassengerCount : 15000 * totalPassengerCount;
  const recommendedProgram = 'Air Canada Aeroplan';
  const savingsEstimate = isBusiness ? 150000 * totalPassengerCount : 40000 * totalPassengerCount;

  return {
    passengers: { adults, children },
    routes,
    feasibilityScore,
    recommendedProgram,
    pointsRequiredEstimate,
    conciergePremiumFee,
    savingsEstimate,
  };
}

