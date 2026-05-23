import { Clipboard, Linking } from 'react-native';

/**
 * Maps a credit card ID to its bank's online rewards transfer portal.
 * 
 * @param cardId Unique credit card identifier
 * @returns The destination URL string of the bank portal
 */
export function getBankTransferUrl(cardId: string): string {
  const id = cardId.toLowerCase();
  if (id.includes('axis')) {
    return 'https://edgerewards.axisbank.co.in/';
  }
  if (id.includes('amex') || id.includes('american')) {
    return 'https://www.americanexpress.com/in/rewards/';
  }
  if (id.includes('hsbc')) {
    return 'https://www.hsbc.co.in/credit-cards/rewards/';
  }
  if (id.includes('hdfc')) {
    return 'https://www.hdfcrewards.com/';
  }
  return 'https://edgerewards.axisbank.co.in/';
}

/**
 * Maps a loyalty partner name to their points search page.
 * 
 * @param partnerName Name of airline/hotel loyalty program
 * @returns Pre-populated deep-link URL for points rewards search
 */
export function getPartnerSearchUrl(partnerName: string): string {
  const p = partnerName.toLowerCase();
  if (p.includes('marriott')) {
    return 'https://www.marriott.com/reservation/search.mi?isRewardPlay=true';
  }
  if (p.includes('krisflyer') || p.includes('singapore')) {
    return 'https://www.singaporeair.com/en_UK/ppsclub-krisflyer/use-miles/redeem-flights/';
  }
  if (p.includes('accor')) {
    return 'https://all.accor.com/loyalty-program/reasonstojoin/index.en.shtml';
  }
  return 'https://www.marriott.com/reservation/search.mi?isRewardPlay=true';
}

/**
 * Simulates copying a string value to the clipboard.
 * 
 * @param text The text value to copy
 * @returns Promise resolving to true if copied successfully
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    Clipboard.setString(text);
    return true;
  } catch {
    return false;
  }
}
