import { EnumCourierStatus, EnumDeliveryStatus, OrderStatusInfo } from '@/shared-types'
import { formatDateTime } from '../time'
import { DateTimeDto } from '@/backend-customer-sdk'

export const getDeliveryOrderStatusInfo = (args: {
  courierStatus?: EnumCourierStatus
  orderStatus?: EnumDeliveryStatus
  scheduledAtTime?: DateTimeDto
  refunded?: boolean
}): OrderStatusInfo => {
  const { courierStatus, orderStatus, scheduledAtTime, refunded } = args
  if (refunded) {
    return {
      title: 'This order has been refunded',
      description: `We’re sorry for any inconvenience`,
      progress: 0,
      finalStepName: 'refunded',
      steps: [],
    }
  }
  if (orderStatus === 'REJECTED' || orderStatus === 'CANCELED') {
    return {
      title: 'This order has been canceled',
      description: `We’re sorry for any inconvenience`,
      progress: 0,
      finalStepName: 'canceled',
      steps: [],
    }
  }
  if (orderStatus == 'SCHEDULED') {
    return {
      title: 'Your Order is Scheduled',
      description: scheduledAtTime ? `Estimated Arrival ${formatDateTime(scheduledAtTime)}` : '',
      progress: 0,
      steps: [
        { name: 'preparing', state: 'pending' },
        { name: 'in-store', state: 'pending' },
        { name: 'delivery', state: 'pending' },
        { name: 'fulfilled', state: 'pending' },
      ],
    }
  }
  if (orderStatus == 'FULFILLED') {
    return {
      title: 'Thanks for ordering!',
      description: 'This order is complete',
      progress: 1,
      finalStepName: 'fulfilled',
      steps: [
        { name: 'preparing', state: 'completed' },
        { name: 'in-store', state: 'completed' },
        { name: 'delivery', state: 'completed' },
        { name: 'fulfilled', state: 'completed' },
      ],
    }
  }

  if (!courierStatus) {
    return {
      title: 'Status Unknown',
      description: 'Please contact support',
      progress: 0,
      steps: [
        { name: 'preparing', state: 'pending' },
        { name: 'in-store', state: 'pending' },
        { name: 'delivery', state: 'pending' },
        { name: 'fulfilled', state: 'pending' },
      ],
    }
  }

  const courierStatusToStatusInfo: { [key in EnumCourierStatus]: OrderStatusInfo } = {
    UNASSIGNED: {
      title: `We're preparing your order`,
      description: 'The store is preparing your order right now',
      progress: 0.15,
      steps: [
        { name: 'preparing', state: 'active' },
        { name: 'in-store', state: 'pending' },
        { name: 'delivery', state: 'pending' },
        { name: 'fulfilled', state: 'pending' },
      ],
    },
    ASSIGNED_TO_COURIER: {
      title: 'We found your courier',
      description: 'Your courier will pickup your food soon',
      progress: 0.25,
      steps: [
        { name: 'preparing', state: 'active' },
        { name: 'in-store', state: 'pending' },
        { name: 'delivery', state: 'pending' },
        { name: 'fulfilled', state: 'pending' },
      ],
    },
    ACCEPTED_BY_COURIER: {
      title: 'Picking up your order',
      description: 'Your courier is heading to the store',
      progress: 0.3,
      steps: [
        { name: 'preparing', state: 'completed' },
        { name: 'in-store', state: 'active' },
        { name: 'delivery', state: 'pending' },
        { name: 'fulfilled', state: 'pending' },
      ],
    },
    COURIER_ARRIVED_AT_STORE: {
      title: 'Courier at Store',
      description: 'Awaiting order',
      progress: 0.6,
      steps: [
        { name: 'preparing', state: 'completed' },
        { name: 'in-store', state: 'active' },
        { name: 'delivery', state: 'pending' },
        { name: 'fulfilled', state: 'pending' },
      ],
    },
    COURIER_PICKED_UP_AT_STORE: {
      title: 'Heading your way',
      description: 'Your courier is en-route to you',
      progress: 0.6,
      steps: [
        { name: 'preparing', state: 'completed' },
        { name: 'in-store', state: 'completed' },
        { name: 'delivery', state: 'active' },
        { name: 'fulfilled', state: 'pending' },
      ],
    },
    COURIER_ON_THE_WAY: {
      title: 'Heading your way',
      description: 'Your courier is en-route to you',
      progress: 0.75,
      steps: [
        { name: 'preparing', state: 'completed' },
        { name: 'in-store', state: 'completed' },
        { name: 'delivery', state: 'active' },
        { name: 'fulfilled', state: 'pending' },
      ],
    },
    COURIER_ARRIVED_AT_CUSTOMER: {
      title: 'Courier Arrived',
      description: 'At your location',
      progress: 0.8,
      steps: [
        { name: 'preparing', state: 'completed' },
        { name: 'in-store', state: 'completed' },
        { name: 'delivery', state: 'active' },
        { name: 'fulfilled', state: 'pending' },
      ],
    },
    DELIVERED_BY_COURIER: {
      title: 'Order Delivered',
      description: 'Thank you for using our service',
      progress: 1,
      steps: [
        { name: 'preparing', state: 'completed' },
        { name: 'in-store', state: 'completed' },
        { name: 'delivery', state: 'completed' },
        { name: 'fulfilled', state: 'completed' },
      ],
    },
    DELIVERY_FAILED: {
      title: 'Delivery Failed',
      description: 'Please contact support',
      progress: 0,
      steps: [
        { name: 'preparing', state: 'pending' },
        { name: 'in-store', state: 'pending' },
        { name: 'delivery', state: 'pending' },
        { name: 'fulfilled', state: 'pending' },
      ],
    },
    CANCELED_BY_DRIVER: {
      title: 'Canceled by Courier',
      description: 'Please reorder',
      progress: 0,
      steps: [
        { name: 'preparing', state: 'pending' },
        { name: 'in-store', state: 'pending' },
        { name: 'delivery', state: 'pending' },
        { name: 'fulfilled', state: 'pending' },
      ],
    },
  }

  return courierStatusToStatusInfo[courierStatus]
}
