import {
  DateDto,
  TimeSlotDto,
  CartCustomerDto,
  WeekdayAvailableTimeSlotsDto,
  MerchantWithScheduleCustomerDto,
} from '@/backend-customer-sdk'

export type ScheduleDate = {
  id: string
  label: string
  date: DateDto
  timeSlots: TimeSlotDto[]
}

export function getNextAvailableTimeSlot(weekdaysAvailableTimeSlots: WeekdayAvailableTimeSlotsDto[]) {
  const nextDayWithAvailableTimeSlot = weekdaysAvailableTimeSlots.find((item) => item.timeSlots.length > 0)

  if (!nextDayWithAvailableTimeSlot?.timeSlots[0]) {
    return null
  }

  const { day, month, year } = nextDayWithAvailableTimeSlot.date
  const { hour, minute } = nextDayWithAvailableTimeSlot.timeSlots[0].start

  return { year, month, day, minute, hour }
}

export function getNextScheduleDate(merchant: MerchantWithScheduleCustomerDto, dates: ScheduleDate[]) {
  const nextTimeSlot = getNextAvailableTimeSlot(merchant.weekdaysAvailableTimeSlotsDelivery)

  if (!nextTimeSlot) {
    return
  }

  return dates.find(
    (date) =>
      date.date.year === nextTimeSlot.year &&
      date.date.month === nextTimeSlot.month &&
      date.date.day === nextTimeSlot.day
  )
}

export const getScheduleDate = (
  merchant: MerchantWithScheduleCustomerDto | undefined,
  cart: CartCustomerDto | undefined,
  dates: ScheduleDate[]
) => {
  let scheduleDate: ScheduleDate | undefined

  if (cart?.scheduledAtTime) {
    const { scheduledAtTime } = cart

    scheduleDate = dates.find(
      (date) =>
        date.date.year === scheduledAtTime.year &&
        date.date.month === scheduledAtTime.month &&
        date.date.day === scheduledAtTime.day
    )
  } else if (merchant && !merchant.open) {
    scheduleDate = getNextScheduleDate(merchant, dates)
  }

  return scheduleDate
}

export const getScheduleTimeSlot = (cart: CartCustomerDto | undefined, date: ScheduleDate) => {
  let selectedTimeSlot: TimeSlotDto | undefined

  if (cart?.scheduledAtTime) {
    const { scheduledAtTime } = cart

    selectedTimeSlot = date.timeSlots.find(
      (timeSlot) => timeSlot.start.hour === scheduledAtTime.hour && timeSlot.start.minute === scheduledAtTime.minute
    )
  }

  return selectedTimeSlot
}
