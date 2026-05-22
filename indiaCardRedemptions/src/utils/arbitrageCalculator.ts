export function calculateYield(cashPrice: number, pointPrice: number, transferRatio: number): number {
  if (transferRatio <= 0) return 0;
  const cardPointsNeeded = pointPrice / transferRatio;
  return cashPrice / cardPointsNeeded;
}
