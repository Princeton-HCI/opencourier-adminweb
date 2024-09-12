export function parseInputNumber(value: string | undefined): number | undefined {
  if (value) {
    const numberValue = Number(value)
    if (!isNaN(numberValue)) {
      return numberValue
    }
  }
}

export const formatNumberWithUnits = (value: number) => {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(0) + 'B'
  } else if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(0) + 'M'
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(0) + 'K'
  }
  return value.toFixed(0)
}
