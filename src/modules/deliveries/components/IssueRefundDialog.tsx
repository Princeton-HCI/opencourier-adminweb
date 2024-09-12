import {
  Button,
  CurrencyInput,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
  useToast,
} from '../../../admin-web-components'
import { CartCostAdminDto, OrderPaymentInfoAdminDto, RefundAdminDtoReasonEnum } from '../../../backend-admin-sdk'
import { Loader, Undo2Icon } from 'lucide-react'
import React, { useCallback } from 'react'
import { useState } from 'react'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { formatPennies } from '../../../ui-shared-utils'
import { omit } from 'lodash'
import { useIssueRefundMutation } from '@/api/paymentApi'
import { useIssueRefundForm } from '../hooks/form/useIssueRefundForm'
import { IssueRefundFormValues } from '../types'
import { computeRewardPointsDeductionFromRefund } from '../../../math'

export function formatPaymentAmount(payment: Pick<OrderPaymentInfoAdminDto, 'amount' | 'provider'>) {
  if (payment.provider === 'NOSH_POINTS') {
    return payment.amount.toString()
  }

  return `$${formatPennies(payment.amount)}`
}

type RefundOptionsProps = {
  payment: OrderPaymentInfoAdminDto
  customerPointsBalance?: number
  orderCost: Pick<CartCostAdminDto, 'subtotalAmount' | 'totalAmount' | 'rewardsPercentage' | 'rewardPoints'>
}

export function IssueRefundDialog({ payment, customerPointsBalance, orderCost }: RefundOptionsProps) {
  const [activeDialog, setActiveDialog] = useState<boolean>(false)
  const [submitRefund, { isLoading }] = useIssueRefundMutation()
  const { toast } = useToast()
  const form = useIssueRefundForm()

  const refundAmount = form.watch('amount')

  const { rewardPointsDeduction } =
    orderCost.rewardsPercentage !== undefined
      ? computeRewardPointsDeductionFromRefund({
          refundAmount,
          rewardsPercentage: orderCost.rewardsPercentage,
          subtotal: orderCost.subtotalAmount,
          total: orderCost.totalAmount,
        })
      : { rewardPointsDeduction: 0 }

  let deductUpTo = 0
  if (orderCost.rewardPoints !== undefined) {
    deductUpTo = customerPointsBalance
      ? Math.min(orderCost.rewardPoints - payment.pointsDeducted, customerPointsBalance)
      : orderCost.rewardPoints - payment.pointsDeducted
  }

  const onSubmit = async (data: IssueRefundFormValues) => {
    if (rewardPointsDeduction > deductUpTo) {
      toast({
        title: 'Failed',
        description: 'Refund amount exceeds the maximum points deduction amount',
        variant: 'destructive',
      })
      return
    }

    try {
      await submitRefund({
        orderId: payment.orderId, // used for optimistic updates
        input: {
          paymentId: payment.id,
          issueRefundAdminInput: {
            ...data,
          },
        },
      }).unwrap()

      setActiveDialog(false)

      toast({
        title: 'Succeeded',
        description: `Refunded customer ${formatPaymentAmount({ amount: data.amount, provider: payment.provider })}`,
        variant: 'default',
      })
    } catch (error) {
      toast({
        title: 'Failed',
        description: 'Failed to issue refund',
        variant: 'destructive',
      })
    }
  }

  const handleValueChange = useCallback((val: number) => {
    form.setValue('amount', val)
  }, [])

  return (
    <div>
      <Dialog open={activeDialog} onOpenChange={(open) => setActiveDialog(open)}>
        <DialogTrigger>
          <Button className="mr-2 h-8" variant="outline">
            <Undo2Icon className="mr-2 h-4 w-4" /> Refund
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Refund Details</DialogTitle>
            <DialogDescription>
              Refunds take 5-10 days to appear on a customer's statement. Stripe's fees for the original payment won't
              be returned, but there are no additional fees for the refund.
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <div className="grid gap-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <div className="grid gap-4 pt-4">
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="amount" className="text-right self-center">
                      Amount
                    </Label>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ fieldState }) => (
                          <FormItem autoFocus={false} className="w-full">
                            {payment.provider === 'NOSH_POINTS' ? (
                              <Input
                                className="w-full"
                                type="number"
                                onChange={(e) => {
                                  const { value, min, max } = e.target
                                  handleValueChange(Math.max(Number(min), Math.min(Number(max), Number(value))))
                                }}
                                value={form.getValues('amount')}
                                disabled={!payment.isRefundable}
                                max={payment.availableToRefund}
                              />
                            ) : (
                              <CurrencyInput
                                className="w-full"
                                onValueChange={handleValueChange}
                                value={form.getValues('amount')}
                                disabled={!payment.isRefundable}
                                max={payment.availableToRefund}
                              />
                            )}
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-start-2 col-span-3">
                      <FormDescription className="text-xs font-light text-gray-400 ml-1">
                        {payment.amountRefunded === payment.amount
                          ? 'Fully refunded.'
                          : payment.amountRefunded > 0
                          ? `Payment has been partially refunded (${formatPaymentAmount({
                              amount: payment.amountRefunded,
                              provider: payment.provider,
                            })}
                          ), ${formatPaymentAmount({
                            amount: payment.availableToRefund,
                            provider: payment.provider,
                          })}  still available to refund.`
                          : `Refund up to ${formatPaymentAmount({
                              amount: payment.availableToRefund,
                              provider: payment.provider,
                            })}.`}
                      </FormDescription>

                      {payment.provider !== 'NOSH_POINTS' && orderCost.rewardPoints && orderCost.rewardPoints > 0 ? (
                        <>
                          <br />

                          <FormDescription className="text-xs font-light text-gray-400 ml-1">
                            <h6 className="font-bold">Rewards</h6>
                            Order Reward points {orderCost.rewardPoints}
                            <br />
                            Points deduction {rewardPointsDeduction}
                            <br />
                            Deduct up to {deductUpTo}
                            <br />
                            <br />
                            Customer Current Points balance {customerPointsBalance}
                          </FormDescription>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reason" className="text-right">
                      Reason
                    </Label>

                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <Select {...omit(field, ['onChange', 'onBlur', 'ref'])} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Reason" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={RefundAdminDtoReasonEnum.RequestedByCustomer}>
                                Requested by customer
                              </SelectItem>
                              <SelectItem value={RefundAdminDtoReasonEnum.Fraudulent}>Fraudulent</SelectItem>
                              <SelectItem value={RefundAdminDtoReasonEnum.Duplicate}>Duplicate</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="flex flex-col justify-start">
                            <FormControl className="w-full">
                              <Textarea
                                placeholder="Why are you refunding this payment?"
                                className="resize-none text-xs"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs font-light text-gray-400 ml-1">
                              Please add additional details about this refund
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  {isLoading ? (
                    <Button disabled>
                      <Loader className="animate-spin" />
                    </Button>
                  ) : (
                    <Button disabled={!payment.isRefundable} type="submit">
                      {!payment.isRefundable ? 'No funds available to refund' : 'Submit Refund'}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>

          <DialogFooter></DialogFooter>
          <Separator />
        </DialogContent>
      </Dialog>
    </div>
  )
}
