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
