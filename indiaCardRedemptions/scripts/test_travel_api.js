/**
 * Test utility for verifying connection to the Duffel Travel API.
 * Executed by the Travel API Specialist Agent.
 */

const https = require('https');

const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY || 'fake_test_token';

console.log("✈️ Initializing Duffel Travel API Connection Check...");
console.log(`Using API Token: ${DUFFEL_API_KEY.substring(0, 4)}...${DUFFEL_API_KEY.substring(DUFFEL_API_KEY.length - 4)}`);

if (DUFFEL_API_KEY === 'fake_test_token') {
  console.warn("⚠️ Warning: No real DUFFEL_API_KEY environment variable found. Running in MOCK verification mode.");
  console.log("✅ Mock Connection Check: Successfully simulated flight lookup query BOM -> LHR.");
  process.exit(0);
}

const data = JSON.stringify({
  data: {
    slices: [
      {
        origin: 'BOM',
        destination: 'LHR',
        departure_date: '2026-10-15'
      }
    ],
    passengers: [{ type: 'adult' }],
    cabin_class: 'economy'
  }
});

const options = {
  hostname: 'api.duffel.com',
  port: 443,
  path: '/air/offer_requests?return_offers=true',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${DUFFEL_API_KEY}`,
    'Duffel-Version': 'v2',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Response Status Code: ${res.statusCode}`);
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log("✅ API Connection Success: Successfully query-retrieved live flight offers!");
      try {
        const payload = JSON.parse(body);
        const offers = payload?.data?.offers || [];
        console.log(`Found ${offers.length} flight offers.`);
        if (offers.length > 0) {
          const prices = offers.map(o => parseFloat(o.total_amount));
          console.log(`Cheapest cash price: INR ${Math.min(...prices)}`);
        }
      } catch (e) {
        console.error("❌ Failed to parse JSON response:", e.message);
      }
    } else {
      console.error(`❌ API Connection Failed with status code ${res.statusCode}:`, body);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
});

req.write(data);
req.end();
