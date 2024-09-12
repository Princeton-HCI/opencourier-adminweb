export const pluralize = (value: number, word: string, pluralWord = word + 's') => {
  return `${value} ${value === 1 ? word : pluralWord}`
}
