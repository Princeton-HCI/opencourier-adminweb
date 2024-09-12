export type TipIcon = 'ice-cream' | 'clap' | 'party-confetti' | 'wallet'

export type TipOption = {
  label: string
  amount: number
  calculated: number
  type: 'percentage' | 'fixed' | 'custom'
  isDefault: boolean
  icon?: TipIcon
}

const PERCENTAGE_THRESHOLD = 20 * 100 // cents

const TIP_OPTIONS: Array<Omit<TipOption, 'calculated'>> = [
  {
    label: `Cheers to you`,
    type: 'percentage',
    amount: 15,
    icon: 'ice-cream',
    isDefault: false,
  },
  {
    label: `You're great`,
    type: 'percentage',
    amount: 18,
    isDefault: true,
    icon: 'clap',
  },
  {
    label: `Thank you so much`,
    type: 'percentage',
    amount: 20,
    icon: 'party-confetti',
    isDefault: false,
  },
  {
    label: `Cheers to you`,
    type: 'fixed',
    amount: 200, // cents
    icon: 'ice-cream',
    isDefault: false,
  },
  {
    label: `You're great`,
    type: 'fixed',
    amount: 400, // cents
    isDefault: true,
    icon: 'clap',
  },
  {
    label: `Thank you so much`,
    type: 'fixed',
    amount: 500, // cents
    icon: 'party-confetti',
    isDefault: false,
  },
]

export const calculateTipAmounts = (subTotal?: number): TipOption[] => {
  if (!subTotal) {
    return []
  }

  const tips = TIP_OPTIONS.reduce((acc: TipOption[], option) => {
    const type = subTotal >= PERCENTAGE_THRESHOLD ? 'percentage' : 'fixed'
    if (option.type !== type) {
      return acc
    }
    const calculated = type === 'percentage' ? (subTotal * option.amount) / 100 : option.amount
    acc.push({
      label: option.label,
      amount: option.amount,
      calculated: Math.floor(calculated),
      type: option.type,
      isDefault: option.isDefault || false,
      icon: option.icon,
    })
    return acc
  }, [])

  return tips
}
