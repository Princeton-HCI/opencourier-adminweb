import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  useToast,
} from '../../../admin-web-components'

import { RefundAdminDto } from '../../../backend-admin-sdk'
import { AlertTriangle, Loader, XIcon } from 'lucide-react'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { omit } from 'lodash'
import { useCancelRefundForm } from '../hooks/form/useCancelRefundForm'
import { CancelRefundFormValues } from '../types'
import { formatPennies } from '../../../ui-shared-utils'
import { useCancelRefundMutation } from '@/api/paymentApi'

type CancelRefundOptionsProps = {
  orderId: string
  refunds: RefundAdminDto[]
}

export function CancelRefundDialog({ orderId, refunds }: CancelRefundOptionsProps) {
  const [activeDialog, setActiveDialog] = useState<boolean>(false)
  const [cancelRefund, { isLoading }] = useCancelRefundMutation()
  const { toast } = useToast()
  const form = useCancelRefundForm()

  const onSubmit = async (data: CancelRefundFormValues) => {
    try {
      await cancelRefund({
        orderId: orderId,
        input: {
          refundId: data.refundId,
        },
      }).unwrap()

      setActiveDialog(false)

      toast({
        title: 'Succeeded',
        description: `Refund successfully canceled`,
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

  const [isRefundActionable, setIsRefundActionable] = useState<boolean>(true)

  const selectedRefundId = form.watch('refundId')
  const selectedRefund = refunds.find((refund) => refund.refundId === selectedRefundId)

  useEffect(() => {
    if (selectedRefundId) {
      const newSelectedRefund = refunds.find((refund) => refund.id === selectedRefundId)
      setIsRefundActionable(newSelectedRefund?.status === 'REQUIRES_ACTION')
    }
  }, [selectedRefundId, refunds])

  return (
    <div>
      <Dialog open={activeDialog} onOpenChange={(open) => setActiveDialog(open)}>
        <DialogTrigger>
          <Button className="mr-2 h-8" variant="outline">
            <XIcon className="mr-2 h-4 w-4" /> Cancel Refund
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Refund</DialogTitle>
          </DialogHeader>

          {!isRefundActionable && selectedRefundId && (
            <>
              <Badge variant="outline" className="rounded px-2 py-1 flex items-center w-full">
                <AlertTriangle className="mr-2" /> Cannot cancel this refund
              </Badge>
              <p className="text-xs text-gray-400">
                Only refunds with a status of 'REQUIRES_ACTION' can be canceled.
                {selectedRefund && ` The selected refund has a status of '${selectedRefund.status}'`}
              </p>
            </>
          )}

          <Separator />

          <div className="grid gap-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="refundId" className="text-right self-center">
                    Refund
                  </Label>

                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="refundId"
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <Select {...omit(field, ['onChange', 'onBlur', 'ref'])} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Refund" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {refunds.map((refund) => (
                                <SelectItem
                                  key={refund.id}
                                  value={refund.refundId!}
                                  className="flex items-center justify-start"
                                >
                                  <span className="font-md">{`$${formatPennies(refund.amount)}`}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end items-center pt-6 space-x-2">
                  {isLoading ? (
                    <Button disabled>
                      <Loader className="animate-spin" />
                    </Button>
                  ) : (
                    <Button disabled={!isRefundActionable} type="submit">
                      Cancel refund
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
