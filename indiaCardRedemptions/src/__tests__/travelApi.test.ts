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

describe('Duffel Travel API Order Creation', () => {
  let originalFetch: typeof global.fetch;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should successfully create an order and return PNR booking reference', async () => {
    const mockOrderResponse = {
      data: {
        booking_reference: 'XYZ789',
        id: 'ord_0000abc',
        slices: [{ origin: 'BOM', destination: 'LHR' }],
      },
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockOrderResponse),
      } as Response)
    );

    const passenger = {
      firstName: 'Barry',
      lastName: 'Developer',
      email: 'barry@example.com',
      passportNumber: 'A1234567',
    };

    // @ts-ignore
    const { createDuffelOrder } = require('../utils/travelApi');
    const result = await createDuffelOrder('off_xyz', passenger, 'fake_token');

    expect(result).toEqual({
      bookingReference: 'XYZ789',
      orderId: 'ord_0000abc',
      status: 'confirmed',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.duffel.com/air/orders',
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

  it('should return null if order creation response is not ok', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
      } as Response)
    );

    const passenger = {
      firstName: 'Barry',
      lastName: 'Developer',
      email: 'barry@example.com',
      passportNumber: 'A1234567',
    };

    // @ts-ignore
    const { createDuffelOrder } = require('../utils/travelApi');
    const result = await createDuffelOrder('off_xyz', passenger, 'fake_token');
    expect(result).toBeNull();
  });

  it('should return null if apiToken is missing', async () => {
    const passenger = {
      firstName: 'Barry',
      lastName: 'Developer',
      email: 'barry@example.com',
      passportNumber: 'A1234567',
    };

    // @ts-ignore
    const { createDuffelOrder } = require('../utils/travelApi');
    const result = await createDuffelOrder('off_xyz', passenger);
    expect(result).toBeNull();
  });

  it('should return null if payload or order object is null/empty', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: null }),
      } as Response)
    );

    const passenger = {
      firstName: 'Barry',
      lastName: 'Developer',
      email: 'barry@example.com',
      passportNumber: 'A1234567',
    };

    // @ts-ignore
    const { createDuffelOrder } = require('../utils/travelApi');
    const result = await createDuffelOrder('off_xyz', passenger, 'fake_token');
    expect(result).toBeNull();
  });

  it('should return null on request exceptions/rejections', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.reject(new Error('Network drop'))
    );

    const passenger = {
      firstName: 'Barry',
      lastName: 'Developer',
      email: 'barry@example.com',
      passportNumber: 'A1234567',
    };

    // @ts-ignore
    const { createDuffelOrder } = require('../utils/travelApi');
    const result = await createDuffelOrder('off_xyz', passenger, 'fake_token');
    expect(result).toBeNull();
  });

  it('should return mock successful order when using test token', async () => {
    const passenger = {
      firstName: 'Barry',
      lastName: 'Developer',
      email: 'barry@example.com',
      passportNumber: 'A1234567',
    };
    // @ts-ignore
    const { createDuffelOrder } = require('../utils/travelApi');
    const result = await createDuffelOrder('off_xyz', passenger, 'test_duffel_token_123');
    expect(result).toEqual({
      bookingReference: 'PNR-LHR789',
      orderId: 'ord_mock_12345',
      status: 'confirmed',
    });
  });
});
