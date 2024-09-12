import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EmailLoginFormValues, PhoneLoginFormValues } from '../../types'

const formPhoneSchema = z.object({
  cellPhone: z
    .string()
    .min(1, { message: 'Phone number is required' })
    .regex(/\d+(@\d+)?/, { message: 'Invalid phone number' }),
  countryCode: z
    .string()
    .min(1, { message: 'Country code is required' })
    .regex(/^\+[1-9][0-9]{0,2}-[A-Z]{2}$/, { message: 'Invalid country code' }),
  verifyCode: z.string().regex(/\d+/, { message: 'Invalid verification code' }).optional(),
})

const formEmailSchema = z.object({
  email: z.string().email().min(1, { message: 'E-mail is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

export const useLoginFormCellPhone = (defaultValues: PhoneLoginFormValues) => {
  return useForm<PhoneLoginFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(formPhoneSchema),
    defaultValues,
  })
}

export const useLoginFormEmail = (defaultValues: EmailLoginFormValues) => {
  return useForm<EmailLoginFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(formEmailSchema),
    defaultValues,
  })
}
