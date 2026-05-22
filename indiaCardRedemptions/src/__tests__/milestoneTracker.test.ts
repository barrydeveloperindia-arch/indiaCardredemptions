import {
  calculateAxisAtlasProgress,
  calculateAmexTravelProgress,
  calculateAxisMagnusBurgundyProgress,
} from '../utils/milestoneTracker';

describe('Milestone Tracker Engine (Axis Atlas)', () => {
  it('should handle zero spend correctly', () => {
    const progress = calculateAxisAtlasProgress(0);
    expect(progress.currentSpend).toBe(0);
    expect(progress.nextTarget).toBe(300000);
    expect(progress.progressPercent).toBe(0);
    expect(progress.bonusEarned).toBe(0);
    expect(progress.milestonesReached).toEqual([]);
  });

  it('should track partial progress below the first milestone (3L)', () => {
    const progress = calculateAxisAtlasProgress(150000); // 1.5L
    expect(progress.nextTarget).toBe(300000);
    expect(progress.progressPercent).toBe(50);
    expect(progress.bonusEarned).toBe(0);
    expect(progress.milestonesReached).toEqual([]);
  });

  it('should award 2,500 miles upon hitting 3L and set next target to 7.5L', () => {
    const progress = calculateAxisAtlasProgress(400000); // 4L
    expect(progress.nextTarget).toBe(750000);
    expect(progress.progressPercent).toBe(53); // 400k / 750k = 53.33%
    expect(progress.bonusEarned).toBe(2500);
    expect(progress.milestonesReached).toEqual(['3L Tier']);
  });

  it('should award 7,500 miles (2,500 + 5,000) upon hitting 7.5L and set next target to 15L', () => {
    const progress = calculateAxisAtlasProgress(800000); // 8L
    expect(progress.nextTarget).toBe(1500000);
    expect(progress.progressPercent).toBe(53); // 800k / 1.5M = 53.33%
    expect(progress.bonusEarned).toBe(7500);
    expect(progress.milestonesReached).toEqual(['3L Tier', '7.5L Tier']);
  });

  it('should award 17,500 total miles upon clearing 15L and cap progress at 100%', () => {
    const progress = calculateAxisAtlasProgress(1600000); // 16L
    expect(progress.nextTarget).toBe(1500000);
    expect(progress.progressPercent).toBe(100);
    expect(progress.bonusEarned).toBe(17500); // 2.5k + 5k + 10k
    expect(progress.milestonesReached).toEqual(['3L Tier', '7.5L Tier', '15L Tier']);
  });
});

describe('Milestone Tracker Engine (Amex Platinum Travel)', () => {
  it('should handle zero spend correctly', () => {
    const progress = calculateAmexTravelProgress(0);
    expect(progress.currentSpend).toBe(0);
    expect(progress.nextTarget).toBe(190000);
    expect(progress.progressPercent).toBe(0);
    expect(progress.bonusEarned).toBe(0);
    expect(progress.tajVoucherEarned).toBe(false);
  });

  it('should track partial progress below 1.9L', () => {
    const progress = calculateAmexTravelProgress(95000);
    expect(progress.nextTarget).toBe(190000);
    expect(progress.progressPercent).toBe(50);
    expect(progress.bonusEarned).toBe(0);
    expect(progress.tajVoucherEarned).toBe(false);
  });

  it('should track progress between 1.9L and 4L', () => {
    const progress = calculateAmexTravelProgress(200000);
    expect(progress.nextTarget).toBe(400000);
    expect(progress.progressPercent).toBe(50);
    expect(progress.bonusEarned).toBe(7500);
    expect(progress.milestonesReached).toEqual(['1.9L Tier']);
    expect(progress.tajVoucherEarned).toBe(false);
  });

  it('should track progress between 4L and 7L (without unlocking Taj voucher)', () => {
    const progress = calculateAmexTravelProgress(550000); // 5.5L
    expect(progress.nextTarget).toBe(700000);
    expect(progress.progressPercent).toBe(79); // 550k / 700k = 78.57% -> 79%
    expect(progress.bonusEarned).toBe(17500); // 7.5k + 10k
    expect(progress.milestonesReached).toEqual(['1.9L Tier', '4L Tier']);
    expect(progress.tajVoucherEarned).toBe(false);
  });

  it('should award 40,000 points and the Taj Experiences voucher upon clearing 7L', () => {
    const progress = calculateAmexTravelProgress(750000); // 7.5L
    expect(progress.nextTarget).toBe(700000);
    expect(progress.progressPercent).toBe(100);
    expect(progress.bonusEarned).toBe(40000); // 7.5k + 10k + 22.5k
    expect(progress.milestonesReached).toEqual(['1.9L Tier', '4L Tier', '7L Tier']);
    expect(progress.tajVoucherEarned).toBe(true);
  });
});

describe('Milestone Tracker Engine (Axis Magnus for Burgundy)', () => {
  it('should handle zero spend correctly', () => {
    const progress = calculateAxisMagnusBurgundyProgress(0);
    expect(progress.currentSpend).toBe(0);
    expect(progress.nextTarget).toBe(150000);
    expect(progress.progressPercent).toBe(0);
    expect(progress.bonusEarned).toBe(0);
    expect(progress.milestonesReached).toEqual([]);
  });

  it('should track partial progress below 1.5L', () => {
    const progress = calculateAxisMagnusBurgundyProgress(75000);
    expect(progress.nextTarget).toBe(150000);
    expect(progress.progressPercent).toBe(50);
    expect(progress.bonusEarned).toBe(0);
    expect(progress.milestonesReached).toEqual([]);
  });

  it('should track October 2025 actual cycle rewards (TDD)', () => {
    const progress = calculateAxisMagnusBurgundyProgress(714691.56);
    expect(progress.currentSpend).toBe(714691.56);
    expect(progress.nextTarget).toBe(150000);
    expect(progress.progressPercent).toBe(100);
    expect(progress.bonusEarned).toBe(60698);
    expect(progress.milestonesReached).toEqual(['1.5L Tier']);
  });

  it('should track November 2025 actual cycle rewards (TDD)', () => {
    const progress = calculateAxisMagnusBurgundyProgress(502433.02);
    expect(progress.currentSpend).toBe(502433.02);
    expect(progress.nextTarget).toBe(150000);
    expect(progress.progressPercent).toBe(100);
    expect(progress.bonusEarned).toBe(32060);
    expect(progress.milestonesReached).toEqual(['1.5L Tier']);
  });

  it('should track December 2025 actual cycle rewards (TDD)', () => {
    const progress = calculateAxisMagnusBurgundyProgress(228126.62);
    expect(progress.currentSpend).toBe(228126.62);
    expect(progress.nextTarget).toBe(150000);
    expect(progress.progressPercent).toBe(100);
    expect(progress.bonusEarned).toBe(3856);
    expect(progress.milestonesReached).toEqual(['1.5L Tier']);
  });

  it('should apply credit limit capping correctly on general spend', () => {
    // With 7L credit limit: max eligible spend = 7L above 1.5L = 8.5L.
    // Spend = 9L -> AEP eligible = 7L -> Bonus = floor(700,000 / 200) * 23 = 3500 * 23 = 80500.
    const progress = calculateAxisMagnusBurgundyProgress(900000, 700000);
    expect(progress.bonusEarned).toBe(80500);
  });
});

