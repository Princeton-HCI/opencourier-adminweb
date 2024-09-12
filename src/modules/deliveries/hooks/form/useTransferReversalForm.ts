import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ReversalFormValues } from '@/modules/orders/types'
import { z } from 'zod'

const transferReversalSchema = z.object({
  reversalAmount: z
    .number({ invalid_type_error: 'amount must be a number', required_error: 'amount is required' })
    .min(0),
})

export const useTransferReversalForm = (defaultValues: ReversalFormValues) => {
  return useForm<ReversalFormValues>({
    mode: 'onChange',
    resolver: zodResolver(transferReversalSchema),
    defaultValues,
  })
}
