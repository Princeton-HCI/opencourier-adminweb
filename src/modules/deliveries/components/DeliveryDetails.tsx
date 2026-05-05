import { useGetDeliveryQuery, useSubmitDeliveryEventMutation } from '@/api/deliveriesApi'
import { useAdminPageNavigator } from '@/hooks/useAdminPageNavigator'
import { StatusBadge } from '@/modules/deliveries/components/StatusBadge'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Menu,
  MenuItem,
  MenuItems,
  MenuTrigger,
  useToast,
} from '../../../admin-web-components'
import type { DeliveryAdminDto } from '../../../backend-admin-sdk'
import { EnumDeliveryEventType, EnumDeliveryStatus, STATE_MACHINE } from '../../../shared-types'
import { cn, formatDate, formatPennies } from '../../../ui-shared-utils'
import capitalize from 'lodash/capitalize'
import { ArrowLeftIcon } from 'lucide-react'

function formatMoney(pennies: number | null | undefined): string | null {
  if (pennies == null) return null
  return `$${formatPennies(pennies)}`
}

function displayText(value: string | object | null | undefined): string {
  if (value == null || value === '') return '—'
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

function OrderItemsSection({ items }: { items: DeliveryAdminDto['orderItems'] }) {
  if (!items?.length) return null
  return (
    <div className="space-y-2 border-t pt-6">
      <h3 className="text-sm font-medium">Order items</h3>
      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
        {items.map((item, i) => {
          const row = item as Record<string, unknown>
          const name = typeof row.name === 'string' ? row.name : `Item ${i + 1}`
          const qty = typeof row.quantity === 'number' ? row.quantity : null
          const size = typeof row.size === 'string' ? row.size : null
          return (
            <li key={i}>
              {name}
              {qty != null ? ` × ${qty}` : ''}
              {size ? ` (${size})` : ''}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

type DeliveryDetailsProps = {
  deliveryId: string
  isSheet?: boolean
}

export function DeliveryDetails(props: DeliveryDetailsProps) {
  const { goToDeliveries } = useAdminPageNavigator()

  const getDeliveryResponse = useGetDeliveryQuery({ id: props.deliveryId })

  const [submitDeliveryEvent] = useSubmitDeliveryEventMutation()
  const { toast } = useToast()

  const handleEventSubmit = async (eventType: EnumDeliveryEventType) => {
    if (!getDeliveryResponse.data || !confirm(`Sure you want to trigger "${eventType}" event?`)) {
      return
    }

    try {
      await submitDeliveryEvent({
        deliveryId: getDeliveryResponse.data.id,
        eventType: eventType,
      }).unwrap()
    } catch (error) {
      toast({
        title: 'Delivery status transition failed',
        description: 'Failed to change delivery status',
        variant: 'destructive',
      })
    }
  }

  if (getDeliveryResponse.isLoading) return <span>Loading delivery data.</span>
  if (!getDeliveryResponse.data) return <span>There was a problem loading data.</span>

  const { data: delivery } = getDeliveryResponse

  const DISALLOWED_EVENTS: EnumDeliveryEventType[] = [EnumDeliveryEventType.FAILED]
  const transitions = STATE_MACHINE[delivery.status as EnumDeliveryStatus]?.on
  const possibleEvents = (Object.keys(transitions ?? {}) as EnumDeliveryEventType[]).filter(
    (eventType) => !DISALLOWED_EVENTS.includes(eventType)
  )

  return (
    <>
      {!props.isSheet && (
        <Button variant="link" className="p-0" onClick={() => goToDeliveries()}>
          <div className="bg-gray-100 rounded-full h-6 w-6 flex justify-center items-center mr-1">
            <ArrowLeftIcon className="w-4" />
          </div>
          Back to Deliveries
        </Button>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-end">
          <h2 className="text-xl font-medium tracking-tight">Delivery {delivery.id}</h2>
          <span className="ml-2 text-base font-normal leading-snug text-muted-foreground">
          </span>
        </div>
        <span className="text-sm text-muted-foreground">{formatDate(delivery.createdAt)}</span>
      </div>

      <div className="mt-6 grid gap-6">
        <div className={cn('flex flex-col gap-6', { 'md:flex-row': !props.isSheet })}>
          <div className="flex items-center gap-2">
            <span>Status</span>
            <span className="font-normal leading-snug text-muted-foreground">
              <StatusBadge status={delivery.status} />
            </span>
          </div>

          {possibleEvents.length ? (
            <Menu>
              <MenuTrigger>Trigger event</MenuTrigger>
              <MenuItems>
                {possibleEvents.map((eventType) => (
                  <MenuItem key={eventType} onClick={() => handleEventSubmit(eventType)}>
                    {capitalize(eventType.toLowerCase())}
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          ) : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order & identifiers</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
            <Label className="flex flex-col space-y-1">
              <span>Order reference</span>
              <span className="font-normal leading-snug text-muted-foreground break-all">
                {delivery.orderReference ?? '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>Customer</span>
              <span className="font-normal leading-snug text-muted-foreground">
                {delivery.customerName}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>Customer phone</span>
              <span className="font-normal leading-snug text-muted-foreground">
                {delivery.customerPhoneNumber ?? '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>Currency</span>
              <span className="font-normal leading-snug text-muted-foreground">{delivery.currencyCode}</span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>Order total</span>
              <span className="font-normal leading-snug text-muted-foreground">
                {formatMoney(delivery.orderTotalValue) ?? '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>Total cost</span>
              <span className="font-normal leading-snug text-muted-foreground">
                {formatMoney(delivery.totalCost) ?? '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>Fee</span>
              <span className="font-normal leading-snug text-muted-foreground">
                {formatMoney(delivery.fee) ?? '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>Pay</span>
              <span className="font-normal leading-snug text-muted-foreground">
                {formatMoney(delivery.pay) ?? '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>Tips</span>
              <span className="font-normal leading-snug text-muted-foreground">
                {formatMoney(delivery.tips) ?? '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>Total compensation</span>
              <span className="font-normal leading-snug text-muted-foreground">
                {formatMoney(delivery.totalCompensation) ?? '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>Courier ID</span>
              <span className="font-normal leading-snug text-muted-foreground break-all">
                {delivery.courierId ?? '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>Partner ID</span>
              <span className="font-normal leading-snug text-muted-foreground break-all">
                {delivery.partnerId ?? '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>Delivery quote ID</span>
              <span className="font-normal leading-snug text-muted-foreground break-all">
                {delivery.deliveryQuoteId}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>External store ID</span>
              <span className="font-normal leading-snug text-muted-foreground break-all">
                {delivery.externalStoreId ?? '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>External ID</span>
              <span className="font-normal leading-snug text-muted-foreground break-all">
                {delivery.externalId ?? '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>Idempotency key</span>
              <span className="font-normal leading-snug text-muted-foreground break-all">
                {delivery.idempotencyKey ?? '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1 sm:col-span-2">
              <span>Delivery types</span>
              <span className="font-normal leading-snug text-muted-foreground">
                {delivery.deliveryTypes.length ? delivery.deliveryTypes.join(', ') : '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1 sm:col-span-2">
              <span>Pickup types</span>
              <span className="font-normal leading-snug text-muted-foreground">
                {delivery.pickupTypes.length ? delivery.pickupTypes.join(', ') : '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1 sm:col-span-2">
              <span>Customer notes</span>
              <span className="font-normal leading-snug text-muted-foreground whitespace-pre-wrap">
                {delivery.customerNotes.length ? delivery.customerNotes.join('\n') : '—'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>Dropoff signature required</span>
              <span className="font-normal leading-snug text-muted-foreground">
                {delivery.requiresDropoffSignature ? 'Yes' : 'No'}
              </span>
            </Label>
            <Label className="flex flex-col space-y-1">
              <span>ID check required</span>
              <span className="font-normal leading-snug text-muted-foreground">
                {delivery.requiresId ? 'Yes' : 'No'}
              </span>
            </Label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pickup, drop-off & items</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <h3 className="text-sm font-medium sm:col-span-2">Pickup</h3>
              <Label className="flex flex-col space-y-1">
                <span>Name</span>
                <span className="font-normal leading-snug text-muted-foreground">{delivery.pickupName}</span>
              </Label>
              <Label className="flex flex-col space-y-1">
                <span>Phone</span>
                <span className="font-normal leading-snug text-muted-foreground">{delivery.pickupPhoneNumber}</span>
              </Label>
              <Label className="flex flex-col space-y-1 sm:col-span-2">
                <span>Business</span>
                <span className="font-normal leading-snug text-muted-foreground">{delivery.pickupBusinessName}</span>
              </Label>
              <Label className="flex flex-col space-y-1 sm:col-span-2">
                <span>Notes</span>
                <span className="font-normal leading-snug text-muted-foreground whitespace-pre-wrap">
                  {delivery.pickupNotes ?? '—'}
                </span>
              </Label>
              <Label className="flex flex-col space-y-1">
                <span>Location ID</span>
                <span className="font-normal leading-snug text-muted-foreground break-all">{delivery.pickupLocationId}</span>
              </Label>
              <Label className="flex flex-col space-y-1">
                <span>Verification</span>
                <span className="font-normal leading-snug text-muted-foreground break-all">
                  {delivery.pickupVerification ?? '—'}
                </span>
              </Label>
              <Label className="flex flex-col space-y-1">
                <span>Pickup ready</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  {formatDate(delivery.pickupReadyAt)}
                </span>
              </Label>
              <Label className="flex flex-col space-y-1">
                <span>Pickup deadline</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  {formatDate(delivery.pickupDeadlineAt)}
                </span>
              </Label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 border-t pt-6">
              <h3 className="text-sm font-medium sm:col-span-2">Drop-off</h3>
              <Label className="flex flex-col space-y-1">
                <span>Name</span>
                <span className="font-normal leading-snug text-muted-foreground">{delivery.dropoffName}</span>
              </Label>
              <Label className="flex flex-col space-y-1">
                <span>Phone</span>
                <span className="font-normal leading-snug text-muted-foreground">{delivery.dropoffPhoneNumber}</span>
              </Label>
              <Label className="flex flex-col space-y-1 sm:col-span-2">
                <span>Business</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  {displayText(delivery.dropoffBusinessName)}
                </span>
              </Label>
              <Label className="flex flex-col space-y-1 sm:col-span-2">
                <span>Notes</span>
                <span className="font-normal leading-snug text-muted-foreground whitespace-pre-wrap">
                  {delivery.dropoffNotes ?? '—'}
                </span>
              </Label>
              <Label className="flex flex-col space-y-1 sm:col-span-2">
                <span>Seller notes</span>
                <span className="font-normal leading-snug text-muted-foreground whitespace-pre-wrap">
                  {delivery.dropoffSellerNotes ?? '—'}
                </span>
              </Label>
              <Label className="flex flex-col space-y-1">
                <span>Location ID</span>
                <span className="font-normal leading-snug text-muted-foreground break-all">{delivery.dropoffLocationId}</span>
              </Label>
              <Label className="flex flex-col space-y-1">
                <span>Verification</span>
                <span className="font-normal leading-snug text-muted-foreground break-all">
                  {displayText(delivery.dropoffVerification)}
                </span>
              </Label>
              <Label className="flex flex-col space-y-1">
                <span>Drop-off ready</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  {formatDate(delivery.dropoffReadyAt)}
                </span>
              </Label>
              <Label className="flex flex-col space-y-1">
                <span>Drop-off ETA</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  {delivery.dropoffEta ? formatDate(delivery.dropoffEta) : '—'}
                </span>
              </Label>
              <Label className="flex flex-col space-y-1">
                <span>Drop-off deadline</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  {formatDate(delivery.dropoffDeadlineAt)}
                </span>
              </Label>
              <Label className="flex flex-col space-y-1">
                <span>Deliverable action</span>
                <span className="font-normal leading-snug text-muted-foreground">{delivery.deliverableAction}</span>
              </Label>
              <Label className="flex flex-col space-y-1">
                <span>Undeliverable action</span>
                <span className="font-normal leading-snug text-muted-foreground">{delivery.undeliverableAction}</span>
              </Label>
              <Label className="flex flex-col space-y-1 sm:col-span-2">
                <span>Undeliverable reason</span>
                <span className="font-normal leading-snug text-muted-foreground whitespace-pre-wrap">
                  {delivery.undeliverableReason ?? '—'}
                </span>
              </Label>
            </div>

            <OrderItemsSection items={delivery.orderItems} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
