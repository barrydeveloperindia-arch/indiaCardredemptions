import { buildRagPayload, parseTravelScenario } from '../utils/aiHandler';

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

describe('AI Travel Scenario Parser & Feasibility Engine', () => {
  it('should parse passenger counts, routes, dates, and feasibility for a complex family scenario', () => {
    const query = 'brother needs to go to London from Delhi and wife plus two kids need to go to Brasilia on May 29, 2026. Have 120,000 Amex and 56,000 Axis points. Business class preferred.';
    const walletBalances = {
      amex_platinum: 120000,
      axis_m4b: 56000,
    };

    const analysis = parseTravelScenario(query, walletBalances);

    expect(analysis.passengers.adults).toBe(2); // brother + wife
    expect(analysis.passengers.children).toBe(2); // two kids
    expect(analysis.routes).toEqual([
      { origin: 'DEL', destination: 'LHR' },
      { origin: 'LHR', destination: 'BSB' },
    ]);
    expect(analysis.conciergePremiumFee).toBe(100000); // 4 passengers * 25k for Business class
    expect(analysis.recommendedProgram).toBe('Air Canada Aeroplan');
    expect(analysis.feasibilityScore).toBe('MEDIUM'); // Some points, but not enough for full 4 business class awards
  });

  it('should parse a simple economy trip and determine high feasibility if wallet is highly funded', () => {
    const query = '1 adult to London from Delhi in Economy.';
    const walletBalances = {
      axis_m4b: 150000,
    };

    const analysis = parseTravelScenario(query, walletBalances);

    expect(analysis.passengers.adults).toBe(1);
    expect(analysis.passengers.children).toBe(0);
    expect(analysis.feasibilityScore).toBe('HIGH');
    expect(analysis.conciergePremiumFee).toBe(15000); // 1 passenger * 15k
  });

  it('should return LOW feasibility if point balances are completely empty', () => {
    const query = 'Delhi to London for 2 adults in business class.';
    const analysis = parseTravelScenario(query, {});

    expect(analysis.feasibilityScore).toBe('LOW');
  });

  it('should cover all helper branch cases (fallbacks and alternate number spellings)', () => {
    // Empty/Default query test
    const analysisEmpty = parseTravelScenario('', {});
    expect(analysisEmpty.passengers.adults).toBe(1);
    expect(analysisEmpty.routes[0]).toEqual({ origin: 'DEL', destination: 'LHR' });

    // Alternates: "three", "four", digits, default NaN fallbacks
    const analysisThreeFour = parseTravelScenario('three adults and four kids to Singapore', { axis_m4b: 1000000 });
    expect(analysisThreeFour.passengers.adults).toBe(3);
    expect(analysisThreeFour.passengers.children).toBe(4);

    const analysisDigits = parseTravelScenario('5 adults and 1 kid to London', {});
    expect(analysisDigits.passengers.adults).toBe(5);
    expect(analysisDigits.passengers.children).toBe(1);

    const analysisOneOrA = parseTravelScenario('one adult and a kid to London', {});
    expect(analysisOneOrA.passengers.adults).toBe(1);
    expect(analysisOneOrA.passengers.children).toBe(1);
    
    const analysisWordNaN = parseTravelScenario('xyz adults and abc kids to London', {});
    expect(analysisWordNaN.passengers.adults).toBe(1); // falls back to 1
    expect(analysisWordNaN.passengers.children).toBe(1);
  });
});


