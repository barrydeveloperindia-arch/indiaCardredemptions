import transferMatrixData from '../constants/transferMatrix.json';

const matrix: Record<string, Record<string, number>> = transferMatrixData;

/**
 * Retrieves the conversion transfer ratio for a card and a loyalty partner.
 * Math: Miles Received = Card Points * Transfer Ratio
 * 
 * @param cardId Unique ID of the card profile
 * @param partnerId Unique ID of the loyalty partner
 * @returns The conversion ratio multiplier, or 0.0 if not found
 */
export function getTransferRatio(cardId: string, partnerId: string): number {
  if (matrix[cardId] && typeof matrix[cardId][partnerId] === 'number') {
    return matrix[cardId][partnerId];
  }
  return 0.0;
}
