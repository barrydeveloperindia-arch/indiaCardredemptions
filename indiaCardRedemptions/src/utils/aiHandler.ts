export interface RagPayload {
  systemInstruction: string;
  contextMessage: string;
}

/**
 * Builds a RAG prompt payload containing the user's loyalty cards, point balances,
 * and specific transfer ratios targeted to their booking destination.
 * 
 * @param walletState Active credit card balances mapping (cardId -> points)
 * @param transferMatrix Active transfer ratios mapping (cardId -> partnerId -> ratio)
 * @param destination Desired flight or hotel booking destination
 * @returns An object containing the LLM system instructions and the formatted context message
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
