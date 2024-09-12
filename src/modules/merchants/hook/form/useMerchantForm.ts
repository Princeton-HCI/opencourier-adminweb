import { DefaultValues, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const formSchema = z.object({
  email: z.string().min(1, { message: 'E-mail is required' }),
  coverImage: z.string().or(z.undefined()).nullable(),
  logo: z.string().or(z.undefined()).nullable(),
  name: z.string().min(1, { message: 'Name is required' }).default(''),
  phone: z.string().min(1, { message: 'Phone is required' }),
  slug: z.string().min(1, { message: 'Slug is required' }),
  timezone: z.string().min(1, { message: 'Timezone is required' }),
  posIntegrationId: z.string().min(1, { message: 'Integration ID is required' }).optional(),
  addressLine1: z.string().min(1, { message: 'Address Line 1 is required' }),
  addressLine2: z.string().or(z.undefined()).nullable(),
  locality: z.string().min(1, { message: 'Locality is required' }),
  administrativeDistrictLevel1: z.string().min(1, { message: 'Administrative District Level 1 is required' }),
  postalCode: z.string().min(1, { message: 'Postal Code is required' }),
  country: z.string().min(1, { message: 'Country is required' }).optional(),
  latitude: z.number(),
  longitude: z.number(),
  deliveryRadiusMiles: z.number().optional(),
  deliveryCommissionRate: z.number(),
  pickupCommissionRate: z.number(),
  taxRate: z.number().or(z.undefined()),
  //merchantGroupId: z.number().or(z.undefined()),
  menuProvider: z.string().min(1, { message: 'Menu Provider is required' }),
  cuisineTypes: z.array(z.string()),
  availability: z.string().min(1, { message: 'Availability is required' }),
  exclusive: z.boolean().optional(),
})

const DEFAULT_TIMEZONE = 'America/Denver'

export type MerchantFormValues = z.infer<typeof formSchema>
export const useMerchantForm = (args: { defaultValues?: DefaultValues<MerchantFormValues> }) => {
  return useForm<MerchantFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(formSchema),
    defaultValues: args.defaultValues ?? {
      addressLine2: null,
      latitude: 0,
      longitude: 0,
      cuisineTypes: [],
      timezone: DEFAULT_TIMEZONE,
      exclusive: false,
    },
  })
}
