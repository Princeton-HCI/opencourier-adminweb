import { useGetOrderQuery, useSubmitOrderEventMutation } from '@/api/deliveriesApi'
import { DefaultLayout } from '@/components/layouts/DefaultLayout'
import { useOrderStatusForm } from '@/modules/orders/hooks/form/useOrderStatusForm'
import { OrderEventFormValues } from '@/modules/orders/types'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icons,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from '../../../admin-web-components'
import { STATE_MACHINE } from '../../../shared-types'
import { omit } from 'lodash'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

const OrderStatusPage: NextPage = () => {
  const router = useRouter()
  const orderId = typeof router.query.id === 'string' ? router.query.id : ''
  const { data } = useGetOrderQuery({ id: orderId })
  const [submitOrderEvent, { isLoading }] = useSubmitOrderEventMutation()
  const { toast } = useToast()

  const form = useOrderStatusForm()

  const handleFormSubmit = async (values: OrderEventFormValues) => {
    if (!data || !confirm(`Submitting event from status "${data.status}": "${values.eventType}"?`)) {
      return
    }

    try {
      await submitOrderEvent({
        orderId: data.id,
        eventType: values.eventType,
      }).unwrap()
    } catch (error) {
      toast({
        title: 'Submit failed',
        description: 'Failed to submit merchant',
        variant: 'destructive',
      })
    }
  }

  return (
    <DefaultLayout>
      {data ? (
        <>
          <div className="flex flex-row">
            <h2 className="text-2xl font-bold tracking-tight grow">Order ID: {data.id}</h2>
          </div>
          <Card className="my-4">
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <Label className="flex flex-col space-y-1">
                <span>Status</span>
                <span className="font-normal leading-snug text-muted-foreground">{data.status}</span>
              </Label>
              <Label className="flex flex-col space-y-1">
                <span>Fulfillment Mode</span>
                <span className="font-normal leading-snug text-muted-foreground">{data.fulfillmentMode}</span>
              </Label>
              <Label className="flex flex-col space-y-1">
                <span>Courier Status</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  {data.deliveryInformation?.courierStatus}
                </span>
              </Label>
              {data.customer ? (
                <Label className="flex flex-col space-y-1">
                  <span>Customer</span>
                  <span className="font-normal leading-snug text-muted-foreground">{`${data.customer.firstName} ${data.customer.lastName}`}</span>
                </Label>
              ) : null}
            </CardContent>
          </Card>
          <Card className="my-4">
            <CardHeader>
              <CardTitle>Change Status</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col h-full space-y-4">
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem className="grid gap-1">
                        <FormLabel>Transition status by submitting an order event</FormLabel>
                        <Select {...omit(field, ['onChange', 'onBlur', 'ref'])} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select order event" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.keys(STATE_MACHINE[data.status].on).map((eventType) => (
                              <SelectItem value={eventType} key={eventType}>
                                {eventType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <Button variant="destructive" disabled={isLoading}>
                      {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                      Submit event
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </>
      ) : null}
    </DefaultLayout>
  )
}

export default OrderStatusPage
