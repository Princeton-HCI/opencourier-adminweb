import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EnumDeliveryEventType } from '../../../../shared-types'
import { OrderEventFormValues } from '../../types'

const formSchema = z.object({
  eventType: z.string().min(1, { message: 'Status is required' }),
})

export const useOrderStatusForm = () => {
  return useForm<OrderEventFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventType: EnumDeliveryEventType.CONFIRMED,
    },
  })
}
