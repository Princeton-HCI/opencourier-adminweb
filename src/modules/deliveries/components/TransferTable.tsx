import {
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Label,
  Separator,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../admin-web-components'
import { OrderAdminDto, OrderPaymentInfoAdminDto, TransferAdminDto } from '../../../backend-admin-sdk'
import { Check, Info, Undo2 } from 'lucide-react'
import React from 'react'
import { useState } from 'react'
import { formatPennies } from '../../../ui-shared-utils'
import { TransferReversalForm } from './TransferReversalForm'
import dayjs from 'dayjs'

type TransfersTableProps = {
  payment: OrderPaymentInfoAdminDto
  order: OrderAdminDto
  transfers?: TransferAdminDto[]
}

export function TransferTable({ payment, order, transfers }: TransfersTableProps) {
  const [activeDialog, setActiveDialog] = useState<string | null>(null)

  const getTransfersWarning = () => {
    if (!transfers) return ''
    const hasMerchantTransfer = transfers.some((transfer) => transfer.merchantOrganizationId)
    const hasDriverTransfer = transfers.some((transfer) => transfer.driverId)
    if (order.fulfillmentMode === 'DELIVERY') {
      if (!hasMerchantTransfer) {
        return 'This is a delivery order, but there is no transfer for the merchant.'
      }
      if (!hasDriverTransfer) {
        return 'This is a delivery order, but there is no transfer for the driver.'
      }
    }
    if (order.fulfillmentMode === 'PICKUP') {
      if (!hasMerchantTransfer) {
        return 'This is a pickup order, but there is no transfer for the merchant.'
      }
      if (hasDriverTransfer) {
        return 'This is a pickup order, but there is an unexpected transfer for a driver.'
      }
    }
    return ''
  }

  const handleDialogOpenChange = (open: boolean, transferId: string | null) => {
    if (!open) {
      setActiveDialog(null)
    } else {
      setActiveDialog(transferId)
    }
  }

  const transfersWarning = getTransfersWarning()

  return (
    <div className="pt-8">
      {transfers ? (
        <Table>
          <TableHeader className="w-[300px] font-bold text-lg">Transfers</TableHeader>
          <TableCaption>transfers for order {order.readableId}</TableCaption>
          <TableHeader>
            <TableRow className="border-b border-gray-300">
              <TableHead className="w-[300px] font-bold">Amount</TableHead>
              <TableHead>For</TableHead>
              <TableHead>Initiated</TableHead>
              <TableHead>Destination</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((transfer) => (
              <React.Fragment key={transfer.id}>
                <TableRow
                  key={transfer.id}
                  onClick={() => handleDialogOpenChange(true, transfer.id)}
                  className="border-b border-gray-300 hover:bg-blue-100 hover:cursor-pointer"
                >
                  <TableCell className="font-bold ml-4 p-2">
                    ${(transfer.amount / 100).toFixed(2)}
                    {transfer.reversed ? (
                      <HoverCard>
                        <HoverCardTrigger>
                          <Badge variant="secondary" className="text-xs py-1 pl-4 inline-flex items-center gap-2 ml-10">
                            Reversed <Undo2 size={12} className="flex-shrink-0" />
                          </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent>Reversed ${formatPennies(transfer.amountReversed)}</HoverCardContent>
                      </HoverCard>
                    ) : transfer.amountReversed > 0 ? (
                      <HoverCard>
                        <HoverCardTrigger>
                          <Badge variant="secondary" className="text-xs py-1 pl-4 inline-flex items-center gap-2 ml-10">
                            {transfer.amountReversed == transfer.amount ? 'Fully reversed' : 'Partialy Reversed'}
                            <Info size={12} className="flex-shrink-0" />
                          </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent className="text-xs font-light">
                          Reversed ${formatPennies(transfer.amountReversed)}
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      <HoverCard>
                        <HoverCardTrigger>
                          <Badge variant="secondary" className="text-xs py-1 pl-4 inline-flex items-center gap-2 ml-10">
                            Succeeded <Check size={12} className="flex-shrink-0" />
                          </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent className="text-xs font-light">
                          Sent ${formatPennies(transfer.amountToPayout)} to {transfer.destination}
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </TableCell>
                  <TableCell>
                    {transfer.merchantOrganizationId ? 'Business' : transfer.driverId ? 'Driver' : 'N/A'}
                  </TableCell>
                  <TableCell>{transfer.createdAt ? dayjs().toDate().toDateString() : 'N/A'}</TableCell>
                  <TableCell>{transfer.destination}</TableCell>
                </TableRow>

                <Dialog
                  open={activeDialog === transfer.id}
                  onOpenChange={(open) => handleDialogOpenChange(open, transfer.id)}
                >
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Transfer Details</DialogTitle>
                      <DialogDescription>View or modify transfer</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-sm">Transfer ID</Label>
                        <div className="col-span-3 text-sm">{transfer.transferId}</div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-sm">Destination</Label>
                        <div className="col-span-3 text-sm">{transfer.destination}</div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-sm">Source</Label>
                        <div className="col-span-3 text-sm">{payment.stripeData?.latestChargeId}</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-sm">Amount</Label>
                      <div className="col-span-3 text-sm">${(transfer.amount / 100).toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-sm">Reversed</Label>
                      <div className="col-span-3 text-sm">${formatPennies(transfer.amountReversed)}</div>
                    </div>
                    <Separator />

                    <TransferReversalForm
                      transfer={transfer}
                      orderId={order.id}
                      onReversalProcessed={(transferId) => handleDialogOpenChange(false, transferId)}
                    />

                    <DialogFooter></DialogFooter>
                    <Separator />
                  </DialogContent>
                </Dialog>
              </React.Fragment>
            ))}
          </TableBody>
          <TableFooter>
            {transfersWarning && <div className="text-red-500 py-4">Warning: {transfersWarning}</div>}
          </TableFooter>
        </Table>
      ) : (
        <></>
      )}
    </div>
  )
}
