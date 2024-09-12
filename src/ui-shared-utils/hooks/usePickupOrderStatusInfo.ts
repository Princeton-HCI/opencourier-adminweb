import { EnumDeliveryStatus, OrderStatusInfo } from '@/shared-types'
import { useEffect, useRef, useState } from 'react'
import { formatDateTime } from '../utils/time'
import { DateTimeDto } from '@/backend-customer-sdk'

const calculateTimeUntilReady = (futureDate: Date): { minutes: number; seconds: number } => {
  const currentDate = new Date()
  const timeDifferenceMilliseconds = futureDate.getTime() - currentDate.getTime()
  const totalSeconds = Math.floor(timeDifferenceMilliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return { minutes, seconds }
}

export function usePickupOrderStatusInfo(args: {
  orderStatus?: EnumDeliveryStatus
  pickupEstimate?: Date
  scheduledAtTime?: DateTimeDto
  refunded?: boolean
}) {
  const { orderStatus, pickupEstimate, scheduledAtTime, refunded } = args
  const [statusInfo, setStatusInfo] = useState<OrderStatusInfo>()
  const [subStatus, setSubStatus] = useState<EnumDeliveryStatus>()
  const countDownInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearCountDownIntervalIfExist = () => {
    if (countDownInterval.current) clearInterval(countDownInterval.current)
  }

  useEffect(() => {
    const calculateProgress = (futureDate?: Date): number => {
      if (!futureDate) {
        return 0
      }

      const minutes = calculateTimeUntilReady(futureDate).minutes
      let progress = 1 - minutes / 30
      // Clamp the progress value between 0.5 and 1
      progress = Math.min(Math.max(0.5 + progress * 0.5, 0.5), 1)
      return progress
    }

    const startCountdown = (futureDate: Date) => {
      clearCountDownIntervalIfExist()
      countDownInterval.current = setInterval(() => {
        const { minutes, seconds } = calculateTimeUntilReady(futureDate)

        // TODO: Transition to prepared should be done in backend.
        if (minutes < 0) {
          clearCountDownIntervalIfExist()
          setSubStatus('PREPARED')
          return
        }

        const progress = calculateProgress(pickupEstimate)
        setStatusInfo({
          title: 'Order confirmed by restaurant...',
          description: `Pickup in ${minutes} minutes and ${seconds} seconds`,
          progress,
          steps: [
            { name: 'preparing-pickup', state: 'active' },
            { name: 'walking', state: progress >= 0.5 ? 'active' : 'pending' },
            { name: 'fulfilled', state: 'pending' },
          ],
        })
      }, 1000)
    }

    if (refunded) {
      setStatusInfo({
        title: 'This order has been refunded',
        description: `We’re sorry for any inconvenience`,
        progress: 0,
        steps: [],
        finalStepName: 'refunded',
      })
    } else if (orderStatus === 'SCHEDULED') {
      setStatusInfo({
        title: 'Your Order is Scheduled',
        description: scheduledAtTime ? `Estimated Arrival ${formatDateTime(scheduledAtTime)}` : '',
        progress: 0,
        steps: [
          { name: 'preparing-pickup', state: 'active' },
          { name: 'walking', state: 'pending' },
          { name: 'fulfilled', state: 'pending' },
        ],
      })
    } else if (orderStatus === 'NEW_ORDER') {
      setStatusInfo({
        title: 'Waiting for confirmation',
        description: 'Your order is waiting to be confirmed',
        progress: 0,
        steps: [
          { name: 'preparing-pickup', state: 'active' },
          { name: 'walking', state: 'pending' },
          { name: 'fulfilled', state: 'pending' },
        ],
      })
    } else if (orderStatus === 'CONFIRMED' && subStatus !== 'PREPARED' && pickupEstimate) {
      startCountdown(pickupEstimate)
    } else if (orderStatus === 'CONFIRMED' && subStatus !== 'PREPARED' && !pickupEstimate) {
      setStatusInfo({
        title: 'Order confirmed by restaurant...',
        description: 'Confirmed',
        progress: 0,
        steps: [
          { name: 'preparing-pickup', state: 'active' },
          { name: 'walking', state: 'pending' },
          { name: 'fulfilled', state: 'pending' },
        ],
      })
    } else if (orderStatus === 'CONFIRMED' && subStatus === 'PREPARED') {
      setStatusInfo({
        title: 'Order is complete!',
        description: 'Ready to pickup at the store.',
        progress: 1,
        steps: [
          { name: 'preparing-pickup', state: 'completed' },
          { name: 'walking', state: 'completed' },
          { name: 'fulfilled', state: 'active' },
        ],
      })
    } else if (orderStatus === 'PICKED_UP' || orderStatus === 'FULFILLED') {
      setStatusInfo({
        title: 'Thanks for ordering!',
        description: 'Your order is complete',
        progress: 1,
        finalStepName: 'fulfilled',
        steps: [
          { name: 'preparing-pickup', state: 'completed' },
          { name: 'walking', state: 'completed' },
          { name: 'fulfilled', state: 'completed' },
        ],
      })
    } else if (orderStatus === 'REJECTED' || orderStatus === 'CANCELED') {
      setStatusInfo({
        title: 'This order has been canceled',
        description: 'We’re sorry for any inconvenience',
        progress: 0,
        steps: [],
        finalStepName: 'canceled',
      })
    } else if (orderStatus === 'PREPARED') {
      setStatusInfo({
        title: 'Ready to pick up',
        description: 'Ready to pickup at the store.',
        progress: 1,
        steps: [
          { name: 'preparing-pickup', state: 'completed' },
          { name: 'walking', state: 'completed' },
          { name: 'fulfilled', state: 'active' },
        ],
      })
    } else if (orderStatus === 'UNKNOWN') {
      setStatusInfo({
        title: '',
        description: 'Unknown',
        progress: 0,
        steps: [
          { name: 'preparing-pickup', state: 'pending' },
          { name: 'walking', state: 'pending' },
          { name: 'fulfilled', state: 'pending' },
        ],
      })
    } else {
      setStatusInfo({
        title: 'Waiting for restaurant...',
        description: 'Default',
        progress: 0,
        steps: [
          { name: 'preparing-pickup', state: 'active' },
          { name: 'walking', state: 'pending' },
          { name: 'fulfilled', state: 'pending' },
        ],
      })
    }

    if (orderStatus !== 'CONFIRMED') clearCountDownIntervalIfExist()

    return () => {
      clearCountDownIntervalIfExist()
    }
  }, [orderStatus, pickupEstimate?.toString(), subStatus])

  return { statusInfo, subStatus }
}
