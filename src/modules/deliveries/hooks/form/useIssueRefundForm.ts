import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { IssueRefundFormValues } from '../../types'
import { RefundAdminDtoReasonEnum } from '../../../../backend-admin-sdk'

const formSchema = z.object({
  description: z.string(),
  amount: z.number({ invalid_type_error: 'Amount must be a number', required_error: 'Amount is required' }).min(0),
  reason: z.string().min(1, { message: 'Reason is required' }),
})

export const useIssueRefundForm = () => {
  return useForm<IssueRefundFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      reason: RefundAdminDtoReasonEnum.RequestedByCustomer,
    },
  })
}
