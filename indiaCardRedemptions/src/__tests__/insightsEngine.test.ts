import { 
  checkAtlasEligibility, 
  cardInsights, 
  multiDipStrategies 
} from '../data/cardInsights';

describe('Axis Atlas MCC Inclusion & Exclusion Engine', () => {
  it('should explicitly exclude commercial utility payment gateways like BharatNXT and Pice', () => {
    const resultNxt = checkAtlasEligibility('BharatNXT payment');
    expect(resultNxt.isEligible).toBe(false);
    expect(resultNxt.rewardMultiplier).toBe(0);
    expect(resultNxt.reason).toContain('BharatNXT');

    const resultPice = checkAtlasEligibility('Pice premium utility');
    expect(resultPice.isEligible).toBe(false);
    expect(resultPice.rewardMultiplier).toBe(0);
    expect(resultPice.reason).toContain('Pice');
  });

  it('should exclude rental payments and wallet loading spends', () => {
    const resultRent = checkAtlasEligibility('My Landlord Rent payment');
    expect(resultRent.isEligible).toBe(false);
    expect(resultRent.rewardMultiplier).toBe(0);

    const resultWallet = checkAtlasEligibility('Paytm Wallet load ₹5000');
    expect(resultWallet.isEligible).toBe(false);
    expect(resultWallet.rewardMultiplier).toBe(0);
  });

  it('should exclude standard utility billing spends', () => {
    const resultUtility = checkAtlasEligibility('State Electricity Utility Bill');
    expect(resultUtility.isEligible).toBe(false);
    expect(resultUtility.rewardMultiplier).toBe(0);
  });

  it('should qualify direct travel bookings for accelerated 5x Edge Miles', () => {
    const resultHotel = checkAtlasEligibility('Taj Hotels Luxury Booking');
    expect(resultHotel.isEligible).toBe(true);
    expect(resultHotel.rewardMultiplier).toBe(5);

    const resultFlight = checkAtlasEligibility('Singapore Airlines flight check');
    expect(resultFlight.isEligible).toBe(true);
    expect(resultFlight.rewardMultiplier).toBe(5);
  });

  it('should qualify general merchant spending for baseline 1x Edge Miles', () => {
    const resultGeneral = checkAtlasEligibility('Amazon Online Grocery Shopping');
    expect(resultGeneral.isEligible).toBe(true);
    expect(resultGeneral.rewardMultiplier).toBe(1);
  });
});

describe('Card Insights Database', () => {
  it('should contain exhaustive milestone and exclusion facts for premium cards', () => {
    expect(cardInsights.length).toBeGreaterThanOrEqual(4);

    const atlas = cardInsights.find(c => c.cardId === 'axis_atlas');
    expect(atlas).toBeDefined();
    expect(atlas?.bulletPoints.some(bp => bp.includes('BharatNXT'))).toBe(true);

    const avios = cardInsights.find(c => c.cardId === 'indusind_avios');
    expect(avios).toBeDefined();
    expect(avios?.bulletPoints.some(bp => bp.includes('Qatar Airways'))).toBe(true);
  });
});

describe('Double & Triple Dip Yield Calculator', () => {
  it('should correctly calculate double dip utility savings on Amex-Gyftr-Amazon Pay strategy', () => {
    const strategy = multiDipStrategies.find(s => s.id === 'amex_gyftr_amazon');
    expect(strategy).toBeDefined();

    const spend = 10000;
    const result = strategy!.calculateReturn(spend);
    // 5% points on 10,000 = 500 points
    expect(result.pointsEarned).toBe(500);
    // return = 500 * 0.40 (200) + 10000 * 0.015 (150) + 10000 * 0.065 (650) = ₹1,000 value
    expect(result.valueBackINR).toBe(1000);
    expect(result.roi).toBe(10); // 1,000 / 10,000 = 10%
  });

  it('should correctly calculate triple dip SmartBuy Infinia hotelstay return', () => {
    const strategy = multiDipStrategies.find(s => s.id === 'infinia_smartbuy_marriott');
    expect(strategy).toBeDefined();

    const spend = 20000;
    const result = strategy!.calculateReturn(spend);
    // smartBuyPoints = 20000 * 0.33 = 6600 points
    // marriottPoints = (20000 / 85) * 10 (~2352 pts) + 2000 flat promo points = 4352 points
    // Total points = 6600 + 4352 = 10952 points
    // Value = 6600 + 4352 = ₹10,952 back
    expect(result.pointsEarned).toBe(10952);
    expect(result.valueBackINR).toBe(10952);
    expect(result.roi).toBeCloseTo(54.76, 1);
  });
});
