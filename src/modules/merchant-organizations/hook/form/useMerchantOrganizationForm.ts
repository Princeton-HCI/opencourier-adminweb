import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MerchantOrganizationFormValues } from '@/modules/merchant-organizations/types'

const formSchema = z.object({
  logo: z.string().or(z.undefined()),
  name: z.string().min(1, { message: 'Name is required' }),
  stripeAccountId: z.string().min(1, { message: 'Stripe Account ID is required' }),
})

export const useMerchantOrganizationForm = () => {
  return useForm<MerchantOrganizationFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(formSchema),
  })
}
