import { DateTimeDto } from '@/backend-customer-sdk'
import dayjs from 'dayjs'

export function formatDateAsHourAndMinute(date: string | number | Date): string {
  return dayjs(date).format('h:mm A')
}

export function formatDate(date: Date | string) {
  return dayjs(date).format('MMMM D, YYYY h:mm A')
}

export function formatDateTime(dateTime: DateTimeDto) {
  const { year, month, day, hour, minute } = dateTime
  const date = new Date()
  date.setFullYear(year, month, day)
  date.setHours(hour, minute)

  const now = new Date()

  const dateFormatter = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' })
  const timeFormatter = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit', hour12: true })

  // Check if the date is today
  if (date.toDateString() === now.toDateString()) {
    return `Today @ ${timeFormatter.format(date)}`
  }

  // Check if the date is tomorrow
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow @ ${timeFormatter.format(date)}`
  }

  // Format for any other day
  return `${dateFormatter.format(date)} @ ${timeFormatter.format(date)}`
}
