export function formatPennies(pennies: number): string {
  return String((pennies / 100).toFixed(2))
}

export function formatRateAsPercentage(rate: number): string {
  return String(parseFloat((rate * 100).toFixed(2)))
}

export function percentageToFraction(rate: number): number {
  return rate / 100
}
