import mccDatabase from '../constants/mccDatabase.json';

const merchantDb: Record<string, { category: string; mcc: string }> = mccDatabase;

/**
 * Calculates the reward points multiplier for a given merchant descriptor and card.
 * 
 * @param merchant The raw merchant description string from the statement
 * @param cardId Unique ID of the card profile
 * @returns The multiplier value (e.g. 5 for 5x, 0 for exclusions)
 */
export function getCardMultiplier(merchant: string, cardId: string): number {
  const query = merchant.toLowerCase().trim();

  // 1. Identify category using static database lookups
  let category = 'general';
  for (const merchantName of Object.keys(merchantDb)) {
    if (query.includes(merchantName.toLowerCase())) {
      category = merchantDb[merchantName].category;
      break;
    }
  }

  // 2. Dynamic keyword fallback classification if not in static database
  if (category === 'general') {
    if (query.includes('rent') || query.includes('landlord')) {
      category = 'rental';
    } else if (query.includes('utility') || query.includes('bill') || query.includes('electricity') || query.includes('gas')) {
      category = 'utility';
    } else if (query.includes('wallet') || query.includes('paytm') || query.includes('load')) {
      category = 'wallet';
    } else if (query.includes('hotel') || query.includes('airline') || query.includes('travel') || query.includes('flight')) {
      category = 'travel';
    }
  }

  // 3. Card-specific rules calculations
  if (cardId === 'axis_atlas') {
    if (category === 'rental' || category === 'utility' || category === 'wallet') {
      return 0; // Axis Atlas strict exclusions
    }
    if (category === 'travel' || category === 'hotels') {
      return 5; // Accelerated travel multiplier
    }
    return 1; // Baseline general multiplier
  }

  if (cardId === 'hdfc_infinia') {
    if (category === 'dining') {
      return 5; // dining multiplier
    }
    return 1;
  }

  // Fallback default multiplier for standard cards or general categories
  return 1;
}
