import flightSweetSpots from '../data/flightSweetSpots.json';

describe('Flight Sweet Spots Database', () => {
  it('should have a region mapping for Europe', () => {
    expect(flightSweetSpots).toHaveProperty('europe');
  });

  it('should recommend Aeroplan for Europe to avoid fuel surcharges', () => {
    const europe = (flightSweetSpots as any).europe;
    expect(europe.recommendations).toBeDefined();
    const aeroplan = europe.recommendations.find((r: any) => r.program === 'aeroplan');
    expect(aeroplan).toBeDefined();
    expect(aeroplan.taxWarning).toBe(false);
  });

  it('should recommend KrisFlyer for SE Asia', () => {
    expect(flightSweetSpots).toHaveProperty('se_asia');
    const seAsia = (flightSweetSpots as any).se_asia;
    const krisflyer = seAsia.recommendations.find((r: any) => r.program === 'krisflyer');
    expect(krisflyer).toBeDefined();
  });
});
