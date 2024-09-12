import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CancelRefundFormValues } from '../../types'

const formSchema = z.object({
  refundId: z.string().min(1, { message: 'You must select a refund' }),
})

export const useCancelRefundForm = () => {
  return useForm<CancelRefundFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(formSchema),
    defaultValues: {
      refundId: '',
    },
  })
}
