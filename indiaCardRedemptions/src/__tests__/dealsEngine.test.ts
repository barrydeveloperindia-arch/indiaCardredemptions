import { pointSales, calculateCostPerPoint, getWalletRecommendation } from '../data/pointSales';

describe('Live Points Sales Engine', () => {
  it('should correctly calculate the INR cost per point for a USD sale', () => {
    // Assuming Hilton 100% Bonus: Buy 10,000 get 10,000 for $100 USD
    // Total points = 20,000. Cost = $100 USD = ₹8,500 INR (assuming 85 FX)
    // Cost per point should be ₹8500 / 20000 = ₹0.425
    
    const hiltonSale = pointSales.find(s => s.partner === 'Hilton Honors');
    expect(hiltonSale).toBeDefined();
    
    const costData = calculateCostPerPoint(hiltonSale!);
    expect(costData.totalPoints).toBe(20000);
    expect(costData.inrCostPerPoint).toBeCloseTo(0.425, 2);
  });

  it('should calculate accurate cost for Avios 50% bonus sale', () => {
    // Assuming Qatar Avios: Buy 20,000 get 10,000 bonus = 30,000 Avios
    // Price = $480 USD = ₹40,800 INR
    // Cost per point = ₹40800 / 30000 = ₹1.36
    
    const qatarSale = pointSales.find(s => s.partner === 'Qatar Privilege Club');
    expect(qatarSale).toBeDefined();

    const costData = calculateCostPerPoint(qatarSale!);
    expect(costData.totalPoints).toBe(30000);
    expect(costData.inrCostPerPoint).toBeCloseTo(1.36, 2);
  });

  it('should recommend Axis Atlas users to NOT buy Avios, but transfer instead', () => {
    // Simulated Wallet state with Axis Atlas
    const mockWallet = {
      axis_atlas: { balance: 15000, spend: 200000 }
    };
    
    const qatarSale = pointSales.find(s => s.partner === 'Qatar Privilege Club');
    const recommendation = getWalletRecommendation(qatarSale!, mockWallet);
    
    expect(recommendation.shouldBuy).toBe(false);
    expect(recommendation.reason).toContain('Axis Atlas');
    expect(recommendation.reason).toContain('transfer Edge Miles');
  });

  it('should recommend buying points if user lacks a transfer card for that partner', () => {
    // Simulated Wallet with only an SBI card (no Avios transfer partners)
    const mockWallet = {
      sbi_aurum: { balance: 40000, spend: 100000 }
    };
    
    const qatarSale = pointSales.find(s => s.partner === 'Qatar Privilege Club');
    const recommendation = getWalletRecommendation(qatarSale!, mockWallet);
    
    expect(recommendation.shouldBuy).toBe(true);
    expect(recommendation.reason).toContain('You do not hold');
  });
});
