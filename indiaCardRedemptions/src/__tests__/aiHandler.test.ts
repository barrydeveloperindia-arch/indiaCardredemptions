import { buildRagPayload } from '../utils/aiHandler';

describe('AI Concierge RAG Context Constructor', () => {
  it('should build a valid RAG payload with wallet states, transfer ratios, and search parameters', () => {
    const walletState = {
      hsbc_premier: 50000,
      axis_m4b: 30000,
    };

    const transferMatrix = {
      hsbc_premier: {
        krisflyer: 1.0,
        accor: 1.0,
      },
      axis_m4b: {
        krisflyer: 0.8,
        accor: 0.0,
      },
    };

    const payload = buildRagPayload(walletState, transferMatrix, 'London');

    expect(payload.systemInstruction).toContain('You are an expert credit card rewards optimizer and concierge assistant in India');
    expect(payload.contextMessage).toContain('London');
    expect(payload.contextMessage).toContain('hsbc_premier: 50,000 points');
    expect(payload.contextMessage).toContain('axis_m4b: 30,000 points');
    expect(payload.contextMessage).toContain('hsbc_premier to krisflyer transfer ratio: 1');
    expect(payload.contextMessage).toContain('axis_m4b to accor transfer ratio: 0');
  });

  it('should handle empty or undefined wallets and matrices without throwing', () => {
    const payload = buildRagPayload({}, {}, 'Singapore');
    expect(payload.systemInstruction).toBeDefined();
    expect(payload.contextMessage).toContain('Singapore');
    expect(payload.contextMessage).toContain('No active card balances');
  });

  it('should handle wallet cards that are not defined in the transfer matrix', () => {
    const walletState = {
      card_without_matrix: 10000,
    };
    const payload = buildRagPayload(walletState, {}, 'Paris');
    expect(payload.contextMessage).toContain('card_without_matrix: 10,000 points');
    expect(payload.contextMessage).not.toContain('transfer ratio');
  });
});
