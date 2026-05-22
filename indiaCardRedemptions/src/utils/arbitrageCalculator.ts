/**
 * Calculates the Value per Point (VPP) in INR.
 * Math: VPP = Cash Price / (Points Cost / Transfer Ratio)
 * 
 * @param cashPrice Cash price of the travel booking in INR
 * @param pointPrice Total points cost required for the ticket
 * @param transferRatio Ratios of points to miles conversion
 * @returns The calculated value per card point in INR, or 0.0 on division by zero
 */
export function calculateVpp(cashPrice: number, pointPrice: number, transferRatio: number): number {
  if (pointPrice <= 0 || transferRatio <= 0) return 0;
  const cardPointsNeeded = pointPrice / transferRatio;
  return cashPrice / cardPointsNeeded;
}

export function calculateYield(cashPrice: number, pointPrice: number, transferRatio: number): number {
  if (transferRatio <= 0) return 0;
  const cardPointsNeeded = pointPrice / transferRatio;
  return cashPrice / cardPointsNeeded;
}
