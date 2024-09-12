'use client'

import { useLoginMutation } from '@/api/authApi'
import { useAdminPageNavigator } from '@/hooks/useAdminPageNavigator'
import { useLoginFormEmail } from '@/modules/auth/hooks/form/useLoginForm'
import { setAccessToken, setChatToken } from '@/modules/auth/slices/authSlice'
import { EmailLoginFormValues } from '@/modules/auth/types'
import {
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icons,
  Input,
  useToast,
} from '../../../admin-web-components'
import { cn, useAppDispatch } from '../../../ui-shared-utils'
import React from 'react'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthEmailForm({ className, ...props }: UserAuthFormProps) {
  const [login, { isLoading: isLoading }] = useLoginMutation()
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const form = useLoginFormEmail({
    email: '',
    password: '',
  })

  const { goHome } = useAdminPageNavigator()
  const handleLoginSubmit = async (values: EmailLoginFormValues) => {
    try {
      const userInfo = await login(values).unwrap()

      if (userInfo.session?.accessToken) {
        dispatch(setAccessToken(userInfo.session.accessToken))
        dispatch(setChatToken(userInfo.chatToken))
        await goHome()
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Failed to login with e-mail',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLoginSubmit)}>
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid gap-1 space-y-0">
                  <FormLabel className="sr-only">E-mail</FormLabel>
                  <Input
                    type="email"
                    placeholder="E-mail"
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    onChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="grid gap-1 space-y-0">
                  <FormLabel className="sr-only">Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Password"
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    onChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isLoading}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
