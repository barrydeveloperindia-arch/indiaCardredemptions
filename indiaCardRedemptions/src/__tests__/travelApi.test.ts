import { searchCashFlights } from '../utils/travelApi';

describe('Duffel Travel API Fetcher', () => {
  let originalFetch: typeof global.fetch;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should fetch flight offers from Duffel API and return the cheapest offer price', async () => {
    const mockResponse = {
      data: {
        offers: [
          { total_amount: '45000.00', total_currency: 'INR' },
          { total_amount: '42000.50', total_currency: 'INR' },
          { total_amount: '50000.00', total_currency: 'INR' },
        ],
      },
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)
    );

    const price = await searchCashFlights('BOM', 'LHR', '2026-10-15', 'fake_token');
    expect(price).toBe(42000.50);

    // Verify request payload
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.duffel.com/air/offer_requests?return_offers=true',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer fake_token',
          'Duffel-Version': 'v2',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should handle empty offers or failed API requests elegantly by returning 0', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
      } as Response)
    );

    const price = await searchCashFlights('BOM', 'LHR', '2026-10-15', 'fake_token');
    expect(price).toBe(0);
  });

  it('should handle exceptions by returning 0', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.reject(new Error('Network failure'))
    );

    const price = await searchCashFlights('BOM', 'LHR', '2026-10-15', 'fake_token');
    expect(price).toBe(0);
  });

  it('should return 0 when apiToken is not provided', async () => {
    const price = await searchCashFlights('BOM', 'LHR', '2026-10-15');
    expect(price).toBe(0);
  });

  it('should return 0 when offers array is empty or not present in the response', async () => {
    // case 1: empty offers array
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { offers: [] } }),
      } as Response)
    );
    expect(await searchCashFlights('BOM', 'LHR', '2026-10-15', 'fake_token')).toBe(0);

    // case 2: null offers
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { offers: null } }),
      } as Response)
    );
    expect(await searchCashFlights('BOM', 'LHR', '2026-10-15', 'fake_token')).toBe(0);
  });
});
