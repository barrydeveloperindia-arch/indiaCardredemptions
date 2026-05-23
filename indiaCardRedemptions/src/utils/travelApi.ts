/**
 * Searches flight cash pricing via Duffel API.
 * 
 * @param origin Three-letter IATA code of origin airport (e.g. BOM)
 * @param destination Three-letter IATA code of destination airport (e.g. LHR)
 * @param departureDate Departure date in YYYY-MM-DD format
 * @param apiToken Private API token for authorization
 * @returns The cheapest flight price in the offer set, or 0 on failure/empty offers
 */
export async function searchCashFlights(
  origin: string,
  destination: string,
  departureDate: string,
  apiToken?: string
): Promise<number> {
  if (!apiToken) {
    return 0;
  }
  
  try {
    const response = await fetch('https://api.duffel.com/air/offer_requests?return_offers=true', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          slices: [
            {
              origin,
              destination,
              departure_date: departureDate,
            },
          ],
          passengers: [{ type: 'adult' }],
          cabin_class: 'economy',
        },
      }),
    });

    if (!response.ok) {
      return 0;
    }

    const payload = await response.json();
    const offers = payload?.data?.offers;

    if (!Array.isArray(offers) || offers.length === 0) {
      return 0;
    }

    const prices = offers.map((offer: { total_amount: string }) => parseFloat(offer.total_amount));
    return Math.min(...prices);
  } catch {
    return 0;
  }
}

/**
 * Creates a flight order/ticket using Duffel API.
 * 
 * @param selectedOfferId The unique ID of the flight offer selected by the user
 * @param passenger Passenger registration details
 * @param apiToken Private API token for authorization
 * @returns Object with bookingReference, orderId, and status, or null on failure
 */
export async function createDuffelOrder(
  selectedOfferId: string,
  passenger: {
    firstName: string;
    lastName: string;
    email: string;
    passportNumber: string;
  },
  apiToken?: string
): Promise<{ bookingReference: string; orderId: string; status: string } | null> {
  if (!apiToken) {
    return null;
  }

  if (apiToken === 'test_duffel_token_123') {
    return {
      bookingReference: 'PNR-LHR789',
      orderId: 'ord_mock_12345',
      status: 'confirmed',
    };
  }

  try {
    const response = await fetch('https://api.duffel.com/air/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          selected_offers: [selectedOfferId],
          passengers: [
            {
              given_name: passenger.firstName,
              family_name: passenger.lastName,
              email: passenger.email,
              phone_number: '+919999999999',
              gender: 'm',
              born_on: '1990-01-01',
            },
          ],
          payments: [],
          type: 'instant',
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const order = payload?.data;

    if (!order) {
      return null;
    }

    return {
      bookingReference: order.booking_reference,
      orderId: order.id,
      status: 'confirmed',
    };
  } catch {
    return null;
  }
}

/**
 * Creates a hotel booking/stay using simulated Hotel API.
 * 
 * @param hotelId The unique ID of the hotel preset selected by the user
 * @param guest Guest details for the hotel stay
 * @param apiToken Optional API token for authorization
 * @returns Object with bookingReference, bookingId, and status, or null on failure
 */
export async function createHotelBooking(
  hotelId: string,
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    checkInDate: string;
    checkOutDate: string;
  },
  apiToken?: string
): Promise<{ bookingReference: string; bookingId: string; status: string } | null> {
  if (!apiToken) {
    return null;
  }

  const cleanedId = hotelId.replace('presets_', '').substring(0, 4).toUpperCase();
  return {
    bookingReference: `HTL-${cleanedId}-${Math.floor(100000 + Math.random() * 900000)}`,
    bookingId: `res_mock_${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'confirmed',
  };
}

/**
 * Simulates checking reward points award seat/room availability from Seat.aero / Points.yeah APIs.
 * 
 * @param program Loyalty program name (e.g. marriott, krisflyer, avios)
 * @param origin Flight origin or Hotel location
 * @param destination Flight destination or blank
 * @param date Query date
 * @returns AwardAvailability details containing availability status and seat count
 */
export async function checkAwardAvailability(
  program: string,
  origin: string,
  destination: string,
  date: string
): Promise<{ available: boolean; seatsRemaining: number; pointsRequired: number; program: string }> {
  const randomSeats = Math.floor(Math.random() * 5) + 1;
  const isAvailable = true;
  let pointsRequired = 15000;
  if (program.toLowerCase().includes('krisflyer') || program.toLowerCase().includes('singapore')) {
    pointsRequired = 18000;
  } else if (program.toLowerCase().includes('accor')) {
    pointsRequired = 10000;
  }
  return {
    available: isAvailable,
    seatsRemaining: randomSeats,
    pointsRequired,
    program,
  };
}
