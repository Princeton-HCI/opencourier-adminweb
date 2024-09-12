import { useGetDeliveryQuery, useSubmitDeliveryEventMutation } from '@/api/deliveriesApi'
import { useAdminPageNavigator } from '@/hooks/useAdminPageNavigator'
import { StatusBadge } from '@/modules/deliveries/components/StatusBadge'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Menu,
  MenuItem,
  MenuItems,
  MenuTrigger,
  useToast,
} from '../../../admin-web-components'
import { EnumDeliveryEventType, STATE_MACHINE } from '../../../shared-types'
import {
  cn,
} from '../../../ui-shared-utils'
import capitalize from 'lodash/capitalize'
import { ArrowLeftIcon } from 'lucide-react'
import dayjs from 'dayjs'

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
  const possibleEvents = (Object.keys(STATE_MACHINE[delivery.status].on) as EnumDeliveryEventType[]).filter(
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
        <span className="text-sm text-muted-foreground">{dayjs(delivery.createdAt).format('MMMM D, YYYY h:mm A')}</span>
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
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
          
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
