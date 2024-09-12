export const enumArrayToString = <T>(enumArray: T[]): string => {
  const enumString = enumArray.join(', ')
  return enumString
}

export function isNotEmpty<T>(item: T | null): item is T {
  return item !== null
}
