import { zodResolver } from '@hookform/resolvers/zod'
import { MerchantUserCreateAdminInputRoleEnum } from '../../../backend-admin-sdk'
import { omit } from 'lodash'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { WithSheetCallbacks } from '../../types/sheet'
import { Button } from '../atoms/Button'
import { Icons } from '../atoms/Icons'
import { Input } from '../atoms/Input'
import { SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../atoms/Sheet'
import { Card, CardContent, CardHeader, CardTitle } from '../molecules/Card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../molecules/Form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../molecules/Select'
import { useToast } from '../molecules/toast/useToast'

const formSchema = z
  .object({
    email: z.string().email().min(1, { message: 'Email is required' }),
    password: z.string().min(1, { message: 'Password is required' }),
    role: z.enum(['MERCHANT_LOCATION_MANAGER', 'MERCHANT_GROUP_ADMIN']),
    merchantManagerId: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.role === 'MERCHANT_LOCATION_MANAGER' && !values.merchantManagerId) {
      ctx.addIssue({
        message: 'Location is required.',
        code: z.ZodIssueCode.custom,
        path: ['merchantManagerId'],
      })
    }
  })

export type MerchantUserFormValues = z.infer<typeof formSchema>

export type MerchantUserFormProps = WithSheetCallbacks<void> & {
  groupMerchants: Array<{ id: string; name: string }>
  isLoading: boolean
} & (
    | { mode: 'create'; createUser: (values: MerchantUserFormValues) => void }
    | {
        mode: 'update'
        updateUser: (userId: string, values: MerchantUserFormValues) => void
        userId: string
        defaultValues?: MerchantUserFormValues
      }
  )

export function MerchantUserForm({ groupMerchants, isLoading, ...props }: MerchantUserFormProps) {
  const { toast } = useToast()

  const form = useForm<MerchantUserFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(formSchema),
    defaultValues: props.mode === 'update' ? props.defaultValues : undefined,
  })

  const handleFormSubmit = async (values: MerchantUserFormValues) => {
    try {
      if (props.mode === 'create') {
        await props.createUser(values)
      }
      if (props.mode === 'update') {
        await props.updateUser(props.userId, values)
      }
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to submit user',
        variant: 'destructive',
      })
    } finally {
      props.onSettled?.()
    }
  }

  const role = form.watch('role')
  const merchantManagerId = form.watch('merchantManagerId')

  // Clear location field if role becomes group admin and location was previously defined.
  useEffect(() => {
    if (role === 'MERCHANT_GROUP_ADMIN' && merchantManagerId) {
      form.setValue('merchantManagerId', undefined)
    }
  }, [role, merchantManagerId])

  return (
    <SheetContent className="w-full md:w-[480px] sm:max-w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col h-full space-y-4" noValidate>
          {props.mode === 'create' ? (
            <SheetHeader>
              <SheetTitle>New merchant user</SheetTitle>
            </SheetHeader>
          ) : null}
          {props.mode === 'update' ? (
            <SheetHeader>
              <SheetTitle>Edit merchant user</SheetTitle>
              <SheetDescription>ID: {props.userId}</SheetDescription>
            </SheetHeader>
          ) : null}

          <div className="space-y-2 overflow-auto scrollbar-hide">
            <Card>
              <CardHeader>
                <CardTitle>Merchant User Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        placeholder="Email"
                        {...omit(field, ['value'])}
                        disabled={field.disabled || isLoading}
                        defaultValue={field.value}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel>Password</FormLabel>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...omit(field, ['value'])}
                        disabled={field.disabled || isLoading}
                        defaultValue={field.value}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={MerchantUserCreateAdminInputRoleEnum.MerchantGroupAdmin}>
                            Merchant Group Admin
                          </SelectItem>
                          <SelectItem value={MerchantUserCreateAdminInputRoleEnum.MerchantLocationManager}>
                            Merchant Location Manager
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {role === 'MERCHANT_LOCATION_MANAGER' ? (
                  <FormField
                    control={form.control}
                    name="merchantManagerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {groupMerchants.map((merchant) => (
                              <SelectItem value={merchant.id}>{merchant.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
              </CardContent>
            </Card>
          </div>

          <SheetFooter>
            <Button disabled={isLoading}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </SheetFooter>
        </form>
      </Form>
    </SheetContent>
  )
}
