import React, { useCallback } from 'react'
import { useTransferReversalForm } from '@/modules/orders/hooks/form/useTransferReversalForm'
import {
  Button,
  CurrencyInput,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useToast,
} from '../../../admin-web-components'
import { ReversalFormValues } from '@/modules/orders/types/index'
import { TransferAdminDto } from '../../../backend-admin-sdk'
import { useReverseTransferMutation } from '@/api/paymentApi'
import { Loader } from 'lucide-react'
import { formatPennies } from '../../../ui-shared-utils'

interface TransferReversalFormProps {
  orderId: string
  transfer: TransferAdminDto
  onReversalProcessed: (transferId: string) => void
}

export const TransferReversalForm = ({ onReversalProcessed, orderId, transfer }: TransferReversalFormProps) => {
  const [submitTransferRequest, { isLoading }] = useReverseTransferMutation()
  const { toast } = useToast()

  const form = useTransferReversalForm({
    reversalAmount: transfer.amountAvailableToReverse,
  })

  const onSubmit = async (data: ReversalFormValues) => {
    try {
      await submitTransferRequest({
        orderId: orderId, // used for optimistic updates
        input: {
          transferId: transfer.transferId,
          transferReversalAdminInput: {
            reversalAmount: data.reversalAmount,
          },
        },
      }).unwrap()
      onReversalProcessed(transfer.id)

      toast({
        title: 'Succeeded',
        description: `Transfer reversed by $${formatPennies(data.reversalAmount)}`,
        variant: 'default',
      })
    } catch (error) {
      toast({
        title: 'Failed',
        description: 'Failed to reverse transfer',
        variant: 'destructive',
      })
    }
  }

  const handleValueChange = useCallback((val: number) => {
    form.setValue('reversalAmount', val)
  }, [])

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-end">
          <div className="flex-grow mr-2">
            <FormField
              control={form.control}
              name="reversalAmount"
              render={({ field, fieldState }) => (
                <FormItem autoFocus={false} className="grid gap-1">
                  <FormLabel>Reverse</FormLabel>
                  <CurrencyInput
                    onValueChange={handleValueChange}
                    value={form.getValues('reversalAmount')}
                    disabled={transfer.reversed || field.disabled}
                    max={transfer.amountAvailableToReverse}
                  />
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>
          {isLoading ? (
            <Button disabled>
              <Loader className="animate-spin" />
            </Button>
          ) : (
            <Button disabled={transfer.reversed} type="submit" className="mr-l self-end">
              {transfer.reversed ? 'reversed' : 'Submit'}
            </Button>
          )}
        </form>
      </Form>
    </div>
  )
}
